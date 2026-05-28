import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { api } from '../lib/api';
import { useMapStore } from '../stores/mapStore';
import { useAuthStore } from '../stores/authStore';
import { useSocket } from '../hooks/useSocket';
import { getMapStyle, MapStyleKey } from '../lib/mapStyles';
import { Avatar2D, AvatarState } from '../components/Avatar2D';
import { ShareBottomSheet } from '../components/ShareBottomSheet';
import { StatusSelector } from '../components/StatusSelector';
import { CircleChat } from '../components/CircleChat';
import { SnapMapStory } from '../components/SnapMapStory';
import { GhostMode } from '../components/GhostMode';
import { DailyChallenges } from '../components/DailyChallenges';
import { ArrivedSafe } from '../components/ArrivedSafe';
import { WeatherBadge } from '../components/WeatherBadge';
import { BatteryIndicator } from '../components/BatteryIndicator';
import { AvatarSelector } from '../components/AvatarSelector';
import { ToastContainer } from '../components/Toast';
import { ZoneLayer } from '../components/ZoneLayer';
import { ZoneCreator } from '../components/ZoneCreator';
import { ZoneEditor } from '../components/ZoneEditor';
import { ZoneManager } from '../components/ZoneManager';
import { ZoneLabels } from '../components/ZoneLabels';
import { ProfileWidget } from '../components/ProfileWidget';
import { incrementChallenge } from '../components/DailyChallenges';
import { OnboardingTutorial, MAP_ONBOARDING_STEPS } from '../components/OnboardingTutorial';

export default function MapPage() {
  const { t } = useTranslation();
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.userId);
  const avatarId = useAuthStore((s) => s.avatarId);
  const { style, members, viewState, setStyle, setMembers, setViewState } = useMapStore();
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [show3DBuildings, setShow3DBuildings] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [manualState, setManualState] = useState<AvatarState | null>(null);
  const [hasSharedWithGroup, setHasSharedWithGroup] = useState(false);
  const [showDailyChallenges, setShowDailyChallenges] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [showZoneCreator, setShowZoneCreator] = useState(false);
  const [zonePoint, setZonePoint] = useState<{ lat: number; lng: number } | null>(null);
  const [zoneRefreshKey, setZoneRefreshKey] = useState(0);
  const [showProfileWidget, setShowProfileWidget] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [showZoneManager, setShowZoneManager] = useState(false);

  /**
   * Generate stories from members data for SnapMapStory
   * Only show members who have actually shared their location (not epoch date)
   */
  const stories = members
    .filter(m => {
      if (m.latitude === 0 || m.isPrivacyModeActive) return false;
      // Filter out members who never shared (capturedAt is epoch or very old)
      const capturedTime = new Date(m.capturedAt).getTime();
      if (capturedTime < 86400000) return false; // epoch = never shared
      const hoursSince = (Date.now() - capturedTime) / 3600000;
      if (hoursSince > 168) return false; // older than 7 days
      return true;
    })
    .map(m => {
      const minutesAgo = Math.floor((Date.now() - new Date(m.capturedAt).getTime()) / 60000);
      let timeAgo = '';
      if (minutesAgo < 1) timeAgo = 'ahora';
      else if (minutesAgo < 60) timeAgo = `hace ${minutesAgo} min`;
      else if (minutesAgo < 1440) timeAgo = `hace ${Math.floor(minutesAgo / 60)}h`;
      else timeAgo = `hace ${Math.floor(minutesAgo / 1440)}d`;

      return {
        userId: m.userId,
        username: m.username,
        avatarId: m.userId === userId ? (avatarId || 'avatar-17') : null,
        action: 'compartió ubicación',
        timeAgo,
      };
    });



  /**
   * Determine avatar state. Manual state takes priority.
   */
  const getAvatarState = useCallback((member: typeof members[0]): AvatarState => {
    if (member.userId === userId && manualState) return manualState;

    const lastUpdate = new Date(member.capturedAt).getTime();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    if (lastUpdate > fiveMinutesAgo) return 'walking';

    const hour = new Date().getHours();
    if (hour >= 23 || hour < 7) return 'sleeping';

    const day = new Date().getDay();
    if (day >= 1 && day <= 5 && hour >= 9 && hour < 17) return 'working';

    return 'idle';
  }, [manualState, userId]);



  const centerOnMe = () => {
    if (!navigator.geolocation) return;
    incrementChallenge('center');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setViewState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          zoom: 15,
        });
        // Always update self position in members using latest store state
        const currentMembers = useMapStore.getState().members;
        const updatedMembers = currentMembers.filter(m => m.userId !== userId);
        updatedMembers.push({
          userId: userId || '',
          username: useAuthStore.getState().username || 'Tu',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          capturedAt: new Date().toISOString(),
          isPrivacyModeActive: false,
        });
        setMembers(updatedMembers);
      },
      () => {},
      { enableHighAccuracy: true },
    );
  };

  // Connect WebSocket
  useSocket(circleId || null);

  useEffect(() => {
    if (circleId) {
      loadLocations().then(() => centerOnMe());
    }
  }, [circleId]);

  const loadLocations = async () => {
    // Save current self-location before overwriting
    const currentSelf = members.find(m => m.userId === userId);
    try {
      const { data } = await api.get(`/locations/circles/${circleId}`);
      const backendMembers = data.members;
      // If backend shows self with lat=0 but we have a local position, keep local
      if (currentSelf && currentSelf.latitude !== 0) {
        const selfInBackend = backendMembers.find((m: any) => m.userId === userId);
        if (selfInBackend && selfInBackend.latitude === 0) {
          selfInBackend.latitude = currentSelf.latitude;
          selfInBackend.longitude = currentSelf.longitude;
          selfInBackend.capturedAt = currentSelf.capturedAt;
        }
      }
      setMembers(backendMembers);
    } catch (err) {
      console.error('Failed to load locations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareLocation = async () => {
    if (!navigator.geolocation) return;

    setSharing(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.post('/locations', {
            circleId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setShareSuccess(true);
          setHasSharedWithGroup(true);
          setShowShareSheet(false);
          setTimeout(() => setShareSuccess(false), 2000);
          loadLocations();
          incrementChallenge('share');

          // Auto-send chat message
          try {
            await api.post(`/chat/circles/${circleId}/messages`, {
              content: `📍 Ha compartido su ubicación`,
              type: 'text',
            });
          } catch { /* silent */ }
        } catch (err) {
          console.error('Failed to share location', err);
        } finally {
          setSharing(false);
        }
      },
      () => setSharing(false),
      { enableHighAccuracy: true },
    );
  };

  return (
    <div className="h-screen w-screen relative">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Onboarding tutorial for first-time users */}
      <OnboardingTutorial steps={MAP_ONBOARDING_STEPS} storageKey="familylink-onboarding-map-done" />

      {/* Map */}
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={(evt) => {
          if (showZoneCreator && evt.lngLat) {
            setZonePoint({ lat: evt.lngLat.lat, lng: evt.lngLat.lng });
          }
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={getMapStyle(style)}
        cursor={showZoneCreator ? 'crosshair' : 'grab'}
      >
        {/* 3D Buildings layer — only when enabled and zoomed in */}
        {show3DBuildings && viewState.zoom >= 15 && (
          <Source
            id="openmaptiles"
            type="vector"
            url={`https://api.maptiler.com/tiles/v3/tiles.json?key=${import.meta.env.VITE_MAPTILER_KEY}`}
          >
            <Layer
              id="3d-buildings"
              source-layer="building"
              type="fill-extrusion"
              minzoom={15}
              paint={{
                'fill-extrusion-color': style === 'dark' ? '#2a2a2e' : '#e0e0e0',
                'fill-extrusion-height': ['get', 'render_height'],
                'fill-extrusion-base': ['get', 'render_min_height'],
                'fill-extrusion-opacity': 0.5,
              }}
            />
          </Source>
        )}


        {/* Member avatars */}
        {members
          .filter((m) => !m.isPrivacyModeActive && m.latitude !== 0)
          .map((member) => (
            <Marker
              key={member.userId}
              latitude={member.latitude}
              longitude={member.longitude}
              anchor="bottom"
            >
              <div
                className="relative cursor-pointer"
                onClick={() => {
                  if (member.userId === userId) {
                    setShowProfileWidget(true);
                  }
                }}
              >
                <Avatar2D
                  username={member.username}
                  avatarId={member.userId === userId ? avatarId : null}
                  state={getAvatarState(member)}
                  isCurrentUser={member.userId === userId}
                  size="md"
                />
                {/* Weather and Battery badges for current user */}
                {member.userId === userId && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1">
                    <WeatherBadge latitude={member.latitude} longitude={member.longitude} />
                    <BatteryIndicator />
                  </div>
                )}
                {/* "Solo tú" badge — only for current user when not shared */}
                {member.userId === userId && !hasSharedWithGroup && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-[9px] bg-warning/90 text-white px-1.5 py-0.5 rounded-full font-medium">
                      Solo tú
                    </span>
                  </div>
                )}
              </div>
            </Marker>
          ))}

        {/* Zone polygons with 2D flat style */}
        <ZoneLayer circleId={circleId || ''} key={zoneRefreshKey} onZoneClick={(zone) => setEditingZone(zone)} />
        {/* Zone name labels (GTA-style) */}
        <ZoneLabels circleId={circleId || ''} key={`labels-${zoneRefreshKey}`} />
      </Map>

      {/* Top left — Back button + SnapMapStory */}
      <div className="absolute top-4 left-2 sm:left-4 flex flex-col gap-2 sm:gap-3 max-w-[180px] sm:max-w-[240px]">
        <button
          onClick={() => navigate('/dashboard')}
          className="pointer-events-auto bg-surface/90 backdrop-blur-md rounded-[12px] sm:rounded-[14px] px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg text-xs sm:text-sm font-medium text-text-primary hover:bg-surface transition-all border border-border/50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1 -mt-0.5">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver
        </button>

        {/* SnapMapStory — recent activity */}
        <div className="hidden sm:block">
          <SnapMapStory stories={stories} />
        </div>
      </div>

      {/* Center — Map style selector */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-[calc(100vw-120px)]">
        <div className="flex gap-1 bg-surface/90 backdrop-blur-md rounded-[14px] p-1 sm:p-1.5 shadow-lg border border-border/50 overflow-x-auto scrollbar-hide">
          {(['streets', 'dark', 'satellite', 'toner'] as MapStyleKey[]).map((s) => (
            <button
              key={s}
              onClick={() => { setStyle(s); if (s === 'dark') incrementChallenge('darkmap'); }}
              className={`px-2 sm:px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                style === s
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background'
              }`}
            >
              {s === 'streets' ? '🗺️' : s === 'dark' ? '🌙' : s === 'satellite' ? '🛰️' : '✒️'}
              <span className="ml-1 hidden sm:inline">{s === 'toner' ? 'Toner' : t(`map.styles.${s}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right side — Zoom controls + center + 3D + Ghost + Heatmap */}
      <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 sm:gap-2">
        <button
          onClick={() => setViewState({ zoom: (viewState.zoom || 13) + 1 })}
          className="bg-surface/90 backdrop-blur-md rounded-[10px] sm:rounded-[12px] w-9 h-9 sm:w-10 sm:h-10 shadow-lg flex items-center justify-center hover:bg-surface transition-all border border-border/50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button
          onClick={() => setViewState({ zoom: (viewState.zoom || 13) - 1 })}
          className="bg-surface/90 backdrop-blur-md rounded-[10px] sm:rounded-[12px] w-9 h-9 sm:w-10 sm:h-10 shadow-lg flex items-center justify-center hover:bg-surface transition-all border border-border/50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <div className="h-px bg-border/50 mx-1.5" />
        <button
          onClick={centerOnMe}
          className="bg-surface/90 backdrop-blur-md rounded-[10px] sm:rounded-[12px] w-9 h-9 sm:w-10 sm:h-10 shadow-lg flex items-center justify-center text-accent hover:bg-surface transition-all border border-border/50"
          title="Centrar en mi ubicación"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
          </svg>
        </button>
        <button
          onClick={() => setShow3DBuildings(!show3DBuildings)}
          className={`bg-surface/90 backdrop-blur-md rounded-[10px] sm:rounded-[12px] w-9 h-9 sm:w-10 sm:h-10 shadow-lg flex items-center justify-center transition-all border border-border/50 ${show3DBuildings ? 'text-accent' : 'text-text-secondary'}`}
          title="Edificios 3D"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>
          </svg>
        </button>

        {/* Ghost Mode toggle */}
        <GhostMode isActive={ghostMode} onToggle={(active) => { setGhostMode(active); if (active) incrementChallenge('ghost'); }} />
      </div>

      {/* Bottom action bar — horizontal scroll carousel */}
      <div className="absolute bottom-3 left-0 right-0 sm:bottom-6 sm:left-4 sm:right-4">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide px-3 sm:px-0 pb-1 sm:justify-center">
          {/* Status button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowStatusSelector(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-surface/90 backdrop-blur-md rounded-[12px] sm:rounded-[14px] shadow-lg border border-border/50 flex items-center justify-center flex-shrink-0"
          >
            <span className="text-lg sm:text-xl">
              {manualState === 'walking' ? '🚶' : manualState === 'sleeping' ? '😴' : manualState === 'working' ? '💼' : '🧍'}
            </span>
          </motion.button>

          {/* ArrivedSafe button */}
          <div className="flex-shrink-0">
            <ArrivedSafe circleId={circleId || ''} />
          </div>

          {/* Share location button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShareSheet(true)}
            disabled={sharing}
            className={`px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-[12px] sm:rounded-[14px] font-medium text-sm shadow-lg transition-all flex-shrink-0 ${
              shareSuccess
                ? 'bg-success text-white'
                : 'bg-accent hover:bg-accent-hover text-white'
            } disabled:opacity-50`}
          >
            {shareSuccess ? '✓ OK' : sharing ? '...' : 'Compartir'}
          </motion.button>

          {/* Create Zone button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => showZoneCreator ? setShowZoneCreator(false) : setShowZoneManager(true)}
            className={`px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-[12px] sm:rounded-[14px] font-medium text-sm shadow-lg transition-all flex-shrink-0 ${
              showZoneCreator
                ? 'bg-success text-white'
                : 'bg-surface/90 backdrop-blur-md border border-border/50 text-text-primary'
            }`}
          >
            {showZoneCreator ? 'Cancelar' : 'Zonas'}
          </motion.button>

          {/* Daily Challenges button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowDailyChallenges(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-surface/90 backdrop-blur-md rounded-[12px] sm:rounded-[14px] shadow-lg border border-border/50 flex items-center justify-center flex-shrink-0"
            title="Desafíos diarios"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </motion.button>

          {/* Chat button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChat(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-surface/90 backdrop-blur-md rounded-[12px] sm:rounded-[14px] shadow-lg border border-border/50 flex items-center justify-center flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>
      </div>
      {/* Share Bottom Sheet */}
      <ShareBottomSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        onShareWithGroup={handleShareLocation}
        members={members.filter(m => m.userId !== userId).map(m => ({ userId: m.userId, username: m.username }))}
        loading={sharing}
      />

      {/* Status Selector */}
      <StatusSelector
        currentState={manualState || 'idle'}
        onStateChange={(state) => setManualState(state)}
        isOpen={showStatusSelector}
        onClose={() => setShowStatusSelector(false)}
      />

      {/* Circle Chat */}
      <CircleChat
        circleId={circleId || ''}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />

      {/* Daily Challenges */}
      <DailyChallenges
        isOpen={showDailyChallenges}
        onClose={() => setShowDailyChallenges(false)}
      />

      {/* Avatar Selector */}
      <AvatarSelector
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        currentAvatarId={avatarId || 'avatar-17'}
        onAvatarChange={(id) => {
          useAuthStore.getState().setAvatarId(id);
        }}
        mapStyle={style}
      />

      {/* Profile Widget */}
      <ProfileWidget
        isOpen={showProfileWidget}
        onClose={() => setShowProfileWidget(false)}
        username={useAuthStore.getState().username || ''}
        avatarId={avatarId}
        isCurrentUser={true}
        status={manualState ? (manualState === 'walking' ? '🚶 En movimiento' : manualState === 'sleeping' ? '😴 Descansando' : manualState === 'working' ? '💼 Trabajando' : '') : ''}
      />

      {/* Zone Manager */}
      <ZoneManager
        circleId={circleId || ''}
        isOpen={showZoneManager}
        onClose={() => setShowZoneManager(false)}
        onCreateZone={() => { setShowZoneManager(false); setShowZoneCreator(true); }}
        onZoneUpdated={() => setZoneRefreshKey(k => k + 1)}
      />

      {/* Zone Editor */}
      <ZoneEditor
        zone={editingZone}
        circleId={circleId || ''}
        isOpen={!!editingZone}
        onClose={() => setEditingZone(null)}
        onUpdated={() => setZoneRefreshKey(k => k + 1)}
      />

      {/* Zone Creator */}
      <ZoneCreator
        circleId={circleId || ''}
        isOpen={showZoneCreator}
        onClose={() => { setShowZoneCreator(false); setZonePoint(null); }}
        selectedPoint={zonePoint}
        onZoneCreated={() => { setZoneRefreshKey(k => k + 1); incrementChallenge('zone'); }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <p className="text-text-secondary">{t('map.loading')}</p>
        </div>
      )}
    </div>
  );
}
