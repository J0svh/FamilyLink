import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
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

export default function MapPage() {
  const { t } = useTranslation();
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.userId);
  const { style, members, viewState, setStyle, setMembers, setViewState } = useMapStore();
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [show3DBuildings, setShow3DBuildings] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [manualState, setManualState] = useState<AvatarState | null>(null);
  const [hasSharedWithGroup, setHasSharedWithGroup] = useState(false); // OFF by default for performance

  /**
   * Determine avatar state. Manual state takes priority.
   */
  const getAvatarState = useCallback((member: typeof members[0]): AvatarState => {
    // If this is the current user and they set a manual state, use it
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

  // Center on user's location on first load + show self as idle
  useEffect(() => {
    centerOnMe();
  }, []);

  const centerOnMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setViewState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          zoom: 15,
        });
        // If current user has no location in members list, add them as idle
        const selfInMembers = members.find(m => m.userId === userId);
        if (!selfInMembers || selfInMembers.latitude === 0) {
          const updatedMembers = members.filter(m => m.userId !== userId);
          updatedMembers.push({
            userId: userId || '',
            username: useAuthStore.getState().username || 'Tú',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            capturedAt: new Date(0).toISOString(), // old date = idle state
            isPrivacyModeActive: false,
          });
          setMembers(updatedMembers);
        }
      },
      () => {}, // silently fail
      { enableHighAccuracy: true },
    );
  };

  // Connect WebSocket
  useSocket(circleId || null);

  useEffect(() => {
    if (circleId) loadLocations();
  }, [circleId]);

  const loadLocations = async () => {
    try {
      const { data } = await api.get(`/locations/circles/${circleId}`);
      setMembers(data.members);
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
      {/* Map */}
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={getMapStyle(style)}
      >
        <NavigationControl position="top-right" />

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
              <div className="relative">
                <Avatar2D
                  username={member.username}
                  state={getAvatarState(member)}
                  isCurrentUser={member.userId === userId}
                  size="md"
                />
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

        {/* Zone polygons - TODO: load from API */}
      </Map>

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="pointer-events-auto bg-surface/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md text-sm font-medium text-text-primary"
        >
          ← Volver
        </button>

        {/* Style selector */}
        <div className="pointer-events-auto flex gap-1 bg-surface/90 backdrop-blur-sm rounded-full p-1 shadow-md">
          {(['streets', 'dark', 'satellite', 'toner'] as MapStyleKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                style === s
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {s === 'toner' ? 'Toner' : t(`map.styles.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Center on me button */}
      <div className="absolute top-16 right-4 flex flex-col gap-2">
        <button
          onClick={centerOnMe}
          className="bg-surface/90 backdrop-blur-sm rounded-full w-10 h-10 shadow-md flex items-center justify-center text-accent hover:bg-surface transition-colors"
          title="Centrar en mi ubicación"
        >
          ◎
        </button>
        <button
          onClick={() => setShow3DBuildings(!show3DBuildings)}
          className={`bg-surface/90 backdrop-blur-sm rounded-full w-10 h-10 shadow-md flex items-center justify-center transition-colors ${show3DBuildings ? 'text-accent' : 'text-text-secondary'}`}
          title="Edificios 3D"
        >
          🏢
        </button>
      </div>

      {/* Bottom action bar */}
      <div className="absolute bottom-8 left-4 right-4 flex justify-center items-center gap-3">
        {/* Status button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowStatusSelector(true)}
          className="px-4 py-4 bg-surface/90 backdrop-blur-sm rounded-full shadow-lg border border-border"
        >
          <span className="text-lg">
            {manualState === 'walking' ? '🚶' : manualState === 'sleeping' ? '😴' : manualState === 'working' ? '💼' : '🧍'}
          </span>
        </motion.button>

        {/* Share location button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowShareSheet(true)}
          disabled={sharing}
          className={`px-8 py-4 rounded-full font-medium shadow-lg transition-all ${
            shareSuccess
              ? 'bg-success text-white'
              : 'bg-accent hover:bg-accent-hover text-white'
          } disabled:opacity-50`}
        >
          {shareSuccess ? '✓ ' + t('map.shared') : sharing ? '...' : t('map.shareLocation')}
        </motion.button>
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

      {/* Chat button */}
      <div className="absolute top-4 right-16 pointer-events-auto">
        <button
          onClick={() => setShowChat(true)}
          className="bg-surface/90 backdrop-blur-sm rounded-full w-10 h-10 shadow-md flex items-center justify-center text-lg hover:bg-surface transition-colors"
          title="Chat del círculo"
        >
          💬
        </button>
      </div>

      {/* Circle Chat */}
      <CircleChat
        circleId={circleId || ''}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
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
