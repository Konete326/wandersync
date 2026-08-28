import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Send,
  Image as ImageIcon,
  Heart,
  Globe,
  Plane,
  Building,
  Compass,
  ArrowRight,
  Crown,
  X,
  MapPin,
  Sparkles,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Check,
  Share2,
  Clock,
  CheckCircle2,
  Lock,
  Home as HomeIcon,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Info,
  Calendar,
  MessageCircle,
  Plus
} from 'lucide-react';
import {
  fetchCommunityMessages,
  postCommunityMessage,
  toggleLikeMessage,
  deleteCommunityMessage
} from '@/services/communityService';
import {
  searchCommunityUsers,
  sendFriendRequest,
  respondFriendRequest,
  fetchFriendsList,
  fetchFriendRequests,
  removeFriendConnection,
  fetchDirectMessages,
  sendDirectMessage,
  createFriendGroup,
  fetchFriendGroups,
  fetchGroupMessages,
  sendGroupMessage,
  joinTripInvitation
} from '@/services/friendService';
import { getPublicCommunityTrips, getMyTrips } from '@/services/tripService';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { useLanguage } from '@/context/LanguageContext';
import { compressImage } from '@/utils/imageCompressor';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import { getCachedData, setCachedData } from '@/utils/realtimeSync';

const COMMUNITY_GROUPS = [
  {
    id: 'global-lounge',
    name: 'Global Traveler Lounge',
    desc: 'Worldwide travel banter, stories & wanderlust talk',
    icon: Globe,
    badgeColor: 'text-orange-400 border-orange-500/30 bg-orange-500/10'
  },
  {
    id: 'travel-buddies',
    name: 'Travel Buddies & Meetups',
    desc: 'Find travel companions, road trips & solo meetups',
    icon: Users,
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
  },
  {
    id: 'flights-and-deals',
    name: 'Flights & Airfare Deals',
    desc: 'Aviation routes, airline sales & seat alerts',
    icon: Plane,
    badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10'
  },
  {
    id: 'stays-and-hotels',
    name: 'Luxury Resorts & Hotels',
    desc: 'Boutique stays, hotel reviews & accommodation tips',
    icon: Building,
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
  {
    id: 'solo-expeditions',
    name: 'Solo Expeditions & Treks',
    desc: 'Hiking trails, backpacker guides & mountain camps',
    icon: Compass,
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  {
    id: 'photography-visuals',
    name: 'Sceneries & Photography',
    desc: 'Travel snapshots, drone shots & camera presets',
    icon: ImageIcon,
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  }
];

const POPULAR_DESTINATIONS = [
  {
    id: 'lahore',
    name: 'Lahore, Pakistan',
    city: 'Lahore',
    country: 'Pakistan',
    flag: '🇵🇰',
    desc: 'Cultural capital of Pakistan with rich Mughal history & lively food street',
    coverImage: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'tokyo',
    name: 'Tokyo, Japan',
    city: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    desc: 'Futuristic neon skyline, ancient shrines, and world-class ramen bars',
    coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'dubai',
    name: 'Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    desc: 'Burj Khalifa grandeur, desert safari dunes & ultra-luxury beach resorts',
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'paris',
    name: 'Paris, France',
    city: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    desc: 'Eiffel Tower vistas, Montmartre art alleys & Seine river walks',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'london',
    name: 'London, UK',
    city: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    desc: 'Big Ben, West End theatre culture, and royal botanical gardens',
    coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'new-york',
    name: 'New York, USA',
    city: 'New York',
    country: 'United States',
    flag: '🇺🇸',
    desc: 'Times Square lights, Broadway energy & Central Park strolls',
    coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'istanbul',
    name: 'Istanbul, Turkey',
    city: 'Istanbul',
    country: 'Turkey',
    flag: '🇹🇷',
    desc: 'Hagia Sophia, Bosphorus cruise views, and bustling Grand Bazaar',
    coverImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'bali',
    name: 'Bali, Indonesia',
    city: 'Bali',
    country: 'Indonesia',
    flag: '🇮🇩',
    desc: 'Ubud rice terraces, clifftop Uluwatu sunsets & tropical surf beaches',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rome',
    name: 'Rome, Italy',
    city: 'Rome',
    country: 'Italy',
    flag: '🇮🇹',
    desc: 'Colosseum ruins, Vatican grandeur, and authentic gelato & pizza',
    coverImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'makkah',
    name: 'Makkah, Saudi Arabia',
    city: 'Makkah',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    desc: 'Holy sanctuary visits, spiritual journeys & Medina hospitality',
    coverImage: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=600&q=80'
  }
];

export default function Community() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showModal, showToast } = useModal();
  const { t } = useLanguage();

  // Navigation tabs: 'chat' | 'trip_circles' | 'friends_chat' | 'find_friends' | 'itineraries'
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'chat');
  const [activeGroup, setActiveGroup] = useState(COMMUNITY_GROUPS[0]);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Group channel messages
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [previewModalImg, setPreviewModalImg] = useState(null);

  // --- TRIP & DESTINATION CIRCLES (Restricted to Residents & Active Journey Travelers) ---
  const [selectedTripCircle, setSelectedTripCircle] = useState(null);
  const [tripCircleMessages, setTripCircleMessages] = useState([]);
  const [loadingTripCircleMessages, setLoadingTripCircleMessages] = useState(false);
  const [tripCircleInputText, setTripCircleInputText] = useState('');
  const [tripCircleSending, setTripCircleSending] = useState(false);
  const [tripCircleSelectedImages, setTripCircleSelectedImages] = useState([]);
  const [tripCircleImagePreviews, setTripCircleImagePreviews] = useState([]);
  const [circleSearchQuery, setCircleSearchQuery] = useState('');
  const tripCircleFileInputRef = useRef(null);
  const tripCircleMessagesEndRef = useRef(null);

  // Friends & Chat Modes ('direct' | 'groups')
  const [chatSubMode, setChatSubMode] = useState('direct'); // 'direct' | 'groups'
  const [friendsList, setFriendsList] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [activeFriend, setActiveFriend] = useState(null);
  const [directMessages, setDirectMessages] = useState([]);
  const [loadingDMs, setLoadingDMs] = useState(false);

  // Custom WhatsApp-style Friend Groups
  const [friendGroups, setFriendGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [activeCustomGroup, setActiveCustomGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [loadingGroupDMs, setLoadingGroupDMs] = useState(false);

  // Group Creation Modal
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('Users');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Message input state for Friends & Groups
  const [chatInputText, setChatInputText] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatSelectedImages, setChatSelectedImages] = useState([]);
  const [chatImagePreviews, setChatImagePreviews] = useState([]);
  const [joiningTripId, setJoiningTripId] = useState(null);

  // Friend Search & Requests state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [friendsFilter, setFriendsFilter] = useState('search'); // 'search' | 'requests' | 'my_friends'

  // User Profile Inspection Modal in Lounge
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // User trips for sharing in chat
  const [myTrips, setMyTrips] = useState([]);
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [loadingMyTrips, setLoadingMyTrips] = useState(false);

  // Public trips
  const [publicTrips, setPublicTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  const fileInputRef = useRef(null);
  const chatFileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatMessagesEndRef = useRef(null);

  // @Mention Autocomplete state
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionTarget, setMentionTarget] = useState(null); // 'lounge' | 'chat' | 'circle'

  // Helper to format @mentions in messages
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const parts = rawText.split(/(@[a-zA-Z0-9_ -]+?)(?=\s|$|[.,!?])/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const isMyMention = user && part.slice(1).trim().toLowerCase() === user.name?.toLowerCase();
        return (
          <span
            key={i}
            className={`inline-block px-1.5 py-0.2 mx-0.5 rounded-md font-bold text-[11px] ${
              isMyMention
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
            }`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // --- Group Channel Messages Loading ---
  const loadMessages = async (silent = false) => {
    const key = `community_msg_${activeGroup.id}`;
    const cached = getCachedData(key);
    if (!silent && !cached) setLoadingMessages(true);
    if (cached && !messages.length) setMessages(cached);

    try {
      const res = await fetchCommunityMessages(activeGroup.id, 80);
      if (res.data?.messages) {
        setMessages(res.data.messages);
        setCachedData(key, res.data.messages);
      } else {
        setMessages([]);
      }
    } catch {
      if (!silent) showToast('Could not load channel messages', 'error');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // --- Public Trips Loading ---
  const loadTrips = async (silent = false) => {
    const key = 'community_public_trips';
    const cached = getCachedData(key);
    if (!silent && !cached) setLoadingTrips(true);
    if (cached && !publicTrips.length) setPublicTrips(cached);

    try {
      const res = await getPublicCommunityTrips();
      if (res.data) {
        setPublicTrips(res.data);
        setCachedData(key, res.data);
      }
    } catch {
    } finally {
      if (!silent) setLoadingTrips(false);
    }
  };

  // --- User's MyTrips Loading ---
  const loadUserTrips = async () => {
    if (!user) return;
    setLoadingMyTrips(true);
    try {
      const res = await getMyTrips();
      if (res.data) {
        setMyTrips(res.data);
      }
    } catch {
    } finally {
      setLoadingMyTrips(false);
    }
  };

  // --- Friends List Loading ---
  const loadFriends = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoadingFriends(true);
    try {
      const res = await fetchFriendsList();
      if (res.data) {
        setFriendsList(res.data);
      }
    } catch {
    } finally {
      if (!silent) setLoadingFriends(false);
    }
  };

  // --- Friend Requests Loading ---
  const loadFriendRequests = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoadingRequests(true);
    try {
      const res = await fetchFriendRequests();
      if (res.data) {
        setIncomingRequests(res.data.incoming || []);
        setOutgoingRequests(res.data.outgoing || []);
      }
    } catch {
    } finally {
      if (!silent) setLoadingRequests(false);
    }
  };

  // --- Friend Groups Loading ---
  const loadFriendGroups = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoadingGroups(true);
    try {
      const res = await fetchFriendGroups();
      if (res.data) {
        setFriendGroups(res.data);
      }
    } catch {
    } finally {
      if (!silent) setLoadingGroups(false);
    }
  };

  // --- Direct 1-on-1 Messages Loading ---
  const loadDirectMessages = async (silent = false) => {
    if (!user || !activeFriend) return;
    if (!silent) setLoadingDMs(true);
    try {
      const res = await fetchDirectMessages(activeFriend._id);
      if (res.data) {
        setDirectMessages(res.data);
      }
    } catch {
    } finally {
      if (!silent) setLoadingDMs(false);
    }
  };

  // --- Group Chat Messages Loading ---
  const loadGroupMessages = async (silent = false) => {
    if (!user || !activeCustomGroup) return;
    if (!silent) setLoadingGroupDMs(true);
    try {
      const res = await fetchGroupMessages(activeCustomGroup._id);
      if (res.data) {
        setGroupMessages(res.data);
      }
    } catch {
    } finally {
      if (!silent) setLoadingGroupDMs(false);
    }
  };

  // --- Trip / Destination Circles Messages Loading ---
  const loadTripCircleMessages = async (circle, silent = false) => {
    if (!circle) return;
    const room = circle.isTrip ? `trip-${circle.tripData?._id}` : `dest-${circle.city.toLowerCase()}`;
    if (!silent) setLoadingTripCircleMessages(true);
    try {
      const res = await fetchCommunityMessages(room, 100);
      if (res.data?.messages) {
        setTripCircleMessages(res.data.messages);
      } else {
        setTripCircleMessages([]);
      }
    } catch {
      if (!silent) showToast('Failed to load circle discussion', 'error');
    } finally {
      if (!silent) setLoadingTripCircleMessages(false);
    }
  };

  // Initial Load
  useEffect(() => {
    loadMessages();
    loadTrips();
    if (user) {
      loadFriends(true);
      loadFriendRequests(true);
      loadFriendGroups(true);
      loadUserTrips();
    }
  }, [user]);

  useEffect(() => {
    loadMessages();
  }, [activeGroup.id]);

  useEffect(() => {
    if (chatSubMode === 'direct' && activeFriend) {
      loadDirectMessages();
    } else if (chatSubMode === 'groups' && activeCustomGroup) {
      loadGroupMessages();
    }
  }, [activeFriend, activeCustomGroup, chatSubMode]);

  // Combined List of Destination & Trip Circles
  const allTripCircles = useMemo(() => {
    const list = [];

    // 1. My Created Trips
    myTrips.forEach((t) => {
      const city = t.destination?.city || t.destinationCity || 'Destination';
      const country = t.destination?.country || t.destinationCountry || '';
      list.push({
        id: `mytrip-${t._id}`,
        name: t.title,
        city,
        country,
        isTrip: true,
        isMyTrip: true,
        tripData: t,
        desc: `Your personal ${t.durationDays || t.days?.length || 3}-day journey`,
        coverImage: t.coverImage?.url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
        room: `trip-${t._id}`
      });
    });

    // 2. Public Community Trips
    publicTrips.forEach((t) => {
      if (!myTrips.some((mt) => mt._id === t._id)) {
        const city = t.destination?.city || t.destinationCity || 'Destination';
        const country = t.destination?.country || t.destinationCountry || '';
        list.push({
          id: `pubtrip-${t._id}`,
          name: t.title,
          city,
          country,
          isTrip: true,
          isMyTrip: false,
          tripData: t,
          desc: `Community trip by ${t.user?.name || 'Explorer'} (${t.durationDays || 3} days)`,
          coverImage: t.coverImage?.url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
          room: `trip-${t._id}`
        });
      }
    });

    // 3. Popular World Destinations
    POPULAR_DESTINATIONS.forEach((dest) => {
      list.push({
        id: `dest-${dest.id}`,
        name: dest.name,
        city: dest.city,
        country: dest.country,
        flag: dest.flag,
        isTrip: false,
        isMyTrip: false,
        tripData: null,
        desc: dest.desc,
        coverImage: dest.coverImage,
        room: `dest-${dest.city.toLowerCase()}`
      });
    });

    return list;
  }, [myTrips, publicTrips]);

  // Set default active trip circle
  useEffect(() => {
    if (allTripCircles.length > 0 && !selectedTripCircle) {
      setSelectedTripCircle(allTripCircles[0]);
    }
  }, [allTripCircles]);

  useEffect(() => {
    if (selectedTripCircle) {
      loadTripCircleMessages(selectedTripCircle);
    }
  }, [selectedTripCircle?.id]);

  // Eligibility Verification for the selected circle
  const circleEligibility = useMemo(() => {
    if (!user) {
      return { canPost: false, reason: 'unauthenticated', badge: '' };
    }
    if (user.role === 'admin') {
      return { canPost: true, reason: 'admin', badge: 'admin' };
    }
    if (!selectedTripCircle) {
      return { canPost: false, reason: 'restricted', badge: '' };
    }

    // 1. Is user the Trip Creator?
    if (selectedTripCircle.isTrip && selectedTripCircle.tripData) {
      const tripOwnerId = selectedTripCircle.tripData.user?._id || selectedTripCircle.tripData.user;
      if (tripOwnerId && tripOwnerId.toString() === user._id.toString()) {
        return { canPost: true, reason: 'creator', badge: 'creator' };
      }
    }

    const targetCity = (selectedTripCircle.city || '').toLowerCase();
    const targetCountry = (selectedTripCircle.country || '').toLowerCase();

    // 2. Is user a Local Resident? (Matches user's profile homeLocation, homeCity, homeCountry)
    const userHome = `${user.preferences?.homeCity || ''} ${user.preferences?.homeCountry || ''} ${user.preferences?.homeLocation || ''}`.toLowerCase();
    if (
      (targetCity && userHome.includes(targetCity)) ||
      (targetCountry && userHome.includes(targetCountry))
    ) {
      return { canPost: true, reason: 'resident', badge: 'resident' };
    }

    // 3. Does user have an active / planned journey for this destination in myTrips?
    const hasJourney = myTrips.some((trip) => {
      const tCity = (trip.destination?.city || trip.destinationCity || trip.title || '').toLowerCase();
      const tCountry = (trip.destination?.country || trip.destinationCountry || '').toLowerCase();
      return (
        (targetCity && (tCity.includes(targetCity) || targetCity.includes(tCity))) ||
        (targetCountry && (tCountry.includes(targetCountry) || targetCountry.includes(tCountry)))
      );
    });

    if (hasJourney) {
      return { canPost: true, reason: 'traveler', badge: 'traveler' };
    }

    return { canPost: false, reason: 'restricted', badge: '' };
  }, [user, selectedTripCircle, myTrips]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollChatToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollCircleToBottom = () => {
    tripCircleMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Handlers for Trip / Destination Circles Messaging ---
  const handleSendTripCircleMessage = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to post messages', 'warning');
      navigate('/login');
      return;
    }
    if (!circleEligibility.canPost) {
      showToast(t('restrictedNotice'), 'warning');
      return;
    }
    if (!tripCircleInputText.trim() && tripCircleSelectedImages.length === 0) return;

    setTripCircleSending(true);
    try {
      const formData = new FormData();
      formData.append('text', tripCircleInputText.trim() || 'Shared a destination photo');
      formData.append('room', selectedTripCircle.room);
      formData.append('destinationTag', selectedTripCircle.city || selectedTripCircle.name);
      if (selectedTripCircle.isTrip && selectedTripCircle.tripData?._id) {
        formData.append('tripId', selectedTripCircle.tripData._id);
      }

      tripCircleSelectedImages.forEach((img) => {
        formData.append('images', img);
      });

      await postCommunityMessage(formData);
      setTripCircleInputText('');
      setTripCircleSelectedImages([]);
      setTripCircleImagePreviews([]);
      await loadTripCircleMessages(selectedTripCircle, true);
      scrollCircleToBottom();
      showToast('Message posted to destination circle!', 'success');
    } catch {
      showToast('Failed to post message', 'error');
    } finally {
      setTripCircleSending(false);
    }
  };

  const handleTripCircleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (tripCircleSelectedImages.length + files.length > 3) {
      showToast('Maximum 3 images allowed per message', 'warning');
      return;
    }
    const newImages = [];
    const newPreviews = [];
    for (const file of files) {
      if (tripCircleSelectedImages.length + newImages.length >= 3) break;
      try {
        const compressed = await compressImage(file);
        newImages.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      } catch {
        newImages.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }
    setTripCircleSelectedImages((prev) => [...prev, ...newImages]);
    setTripCircleImagePreviews((prev) => [...prev, ...newPreviews]);
    if (tripCircleFileInputRef.current) tripCircleFileInputRef.current.value = '';
  };

  const removeTripCircleImage = (index) => {
    setTripCircleSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setTripCircleImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLikeCircleMessage = async (msgId) => {
    if (!user) {
      showToast('Please log in to like messages', 'warning');
      return;
    }
    try {
      const res = await toggleLikeMessage(msgId);
      setTripCircleMessages((prev) =>
        prev.map((m) =>
          m._id === msgId
            ? {
                ...m,
                likes: res.data.isLiked
                  ? [...(m.likes || []), user._id]
                  : (m.likes || []).filter((id) => id !== user._id)
              }
            : m
        )
      );
    } catch {
      showToast('Could not like message', 'error');
    }
  };

  // Switch to trip circle from public trip card
  const handleOpenTripDiscussion = (trip) => {
    const matched = allTripCircles.find((c) => c.tripData?._id === trip._id) || {
      id: `pubtrip-${trip._id}`,
      name: trip.title,
      city: trip.destination?.city || trip.destinationCity || 'Destination',
      country: trip.destination?.country || trip.destinationCountry || '',
      isTrip: true,
      isMyTrip: user && (trip.user?._id === user._id || trip.user === user._id),
      tripData: trip,
      desc: `Community trip (${trip.durationDays || 3} days)`,
      coverImage: trip.coverImage?.url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
      room: `trip-${trip._id}`
    };
    setSelectedTripCircle(matched);
    setActiveTab('trip_circles');
    setMobileShowChat(true);
  };

  // Lounge Message Sender
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to participate in the community chat', 'warning');
      navigate('/login');
      return;
    }
    if (!inputText.trim() && selectedImages.length === 0) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('text', inputText.trim() || 'Shared a photo update');
      formData.append('room', activeGroup.id);

      selectedImages.forEach((img) => {
        formData.append('images', img);
      });

      await postCommunityMessage(formData);
      setInputText('');
      setSelectedImages([]);
      setImagePreviews([]);
      await loadMessages(true);
      scrollToBottom();
    } catch {
      showToast('Failed to post message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleGroupSelect = (grp) => {
    setActiveGroup(grp);
    setMobileShowChat(true);
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (selectedImages.length + files.length > 3) {
      showToast('Maximum 3 images allowed per message', 'warning');
      return;
    }
    const newImages = [];
    const newPreviews = [];
    for (const file of files) {
      if (selectedImages.length + newImages.length >= 3) break;
      try {
        const compressed = await compressImage(file);
        newImages.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      } catch {
        newImages.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }
    setSelectedImages((prev) => [...prev, ...newImages]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChatImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (chatSelectedImages.length + files.length > 3) {
      showToast('Maximum 3 images allowed per message', 'warning');
      return;
    }
    const newImages = [];
    const newPreviews = [];
    for (const file of files) {
      if (chatSelectedImages.length + newImages.length >= 3) break;
      try {
        const compressed = await compressImage(file);
        newImages.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      } catch {
        newImages.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }
    setChatSelectedImages((prev) => [...prev, ...newImages]);
    setChatImagePreviews((prev) => [...prev, ...newPreviews]);
    if (chatFileInputRef.current) chatFileInputRef.current.value = '';
  };

  const removeChatSelectedImage = (index) => {
    setChatSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setChatImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLike = async (msgId) => {
    if (!user) {
      showToast('Please log in to like messages', 'warning');
      return;
    }
    try {
      const res = await toggleLikeMessage(msgId);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msgId
            ? {
                ...m,
                likes: res.data.isLiked
                  ? [...(m.likes || []), user._id]
                  : (m.likes || []).filter((id) => id !== user._id)
              }
            : m
        )
      );
    } catch {
      showToast('Could not like message', 'error');
    }
  };

  const handleDeleteMyMessage = (msg) => {
    showModal({
      title: 'Delete Message?',
      message: 'Are you sure you want to delete your message? This cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteCommunityMessage(msg._id);
          showToast('Message deleted', 'success');
          setMessages((prev) => prev.filter((m) => m._id !== msg._id));
          setTripCircleMessages((prev) => prev.filter((m) => m._id !== msg._id));
        } catch {
          showToast('Failed to delete message', 'error');
        }
      }
    });
  };

  const handleSearchUsers = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await searchCommunityUsers(searchQuery.trim());
      if (res.data) {
        setSearchResults(res.data);
      }
    } catch {
      showToast('Failed to search users', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (recipientId) => {
    setActionLoadingId(recipientId);
    try {
      await sendFriendRequest(recipientId);
      showToast('Friend request sent!', 'success');
      setSearchResults((prev) =>
        prev.map((u) => (u._id === recipientId ? { ...u, friendshipStatus: 'pending_sent' } : u))
      );
      loadFriendRequests(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send friend request', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    setActionLoadingId(requestId);
    try {
      await respondFriendRequest(requestId, action);
      showToast(`Request ${action === 'accept' ? 'accepted' : 'declined'}`, 'success');
      loadFriendRequests(true);
      loadFriends(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveFriend = (friendshipId, friendName) => {
    showModal({
      title: 'Remove Friend',
      message: `Are you sure you want to remove ${friendName} from your friends list?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await removeFriendConnection(friendshipId);
          showToast('Friend removed', 'success');
          loadFriends();
          if (activeFriend?.name === friendName) setActiveFriend(null);
        } catch {
          showToast('Failed to remove friend', 'error');
        }
      }
    });
  };

  const handleStartChatWithFriend = (friendObj) => {
    setActiveFriend(friendObj);
    setChatSubMode('direct');
    setActiveTab('friends_chat');
    setMobileShowChat(true);
  };

  const handleViewUserProfile = (authorUser) => {
    if (!authorUser) return;
    setSelectedProfileUser(authorUser);
    setProfileModalOpen(true);
  };

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      showToast('Please enter a group name', 'warning');
      return;
    }
    if (selectedMemberIds.length === 0) {
      showToast('Please select at least 1 friend to add to the group', 'warning');
      return;
    }

    setCreatingGroup(true);
    try {
      const payload = {
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        icon: newGroupIcon,
        memberIds: selectedMemberIds
      };
      const res = await createFriendGroup(payload);
      showToast(`Group "${newGroupName}" created successfully!`, 'success');
      setCreateGroupModalOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setSelectedMemberIds([]);
      await loadFriendGroups();
      if (res.data) {
        setActiveCustomGroup(res.data);
        setChatSubMode('groups');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create group', 'error');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleSendChatStreamMessage = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!chatInputText.trim() && chatSelectedImages.length === 0) return;

    setChatSending(true);
    try {
      const formData = new FormData();
      formData.append('text', chatInputText.trim() || 'Shared an attachment');

      chatSelectedImages.forEach((img) => {
        formData.append('images', img);
      });

      if (chatSubMode === 'direct' && activeFriend) {
        await sendDirectMessage(activeFriend._id, formData);
        setChatInputText('');
        setChatSelectedImages([]);
        setChatImagePreviews([]);
        await loadDirectMessages(true);
      } else if (chatSubMode === 'groups' && activeCustomGroup) {
        await sendGroupMessage(activeCustomGroup._id, formData);
        setChatInputText('');
        setChatSelectedImages([]);
        setChatImagePreviews([]);
        await loadGroupMessages(true);
      }
      scrollChatToBottom();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setChatSending(false);
    }
  };

  const handleShareTripInChat = async (trip) => {
    if (!user) return;
    try {
      const payload = {
        text: `✈️ Check out my generated itinerary: ${trip.title}!`,
        sharedTripId: trip._id
      };

      if (chatSubMode === 'direct' && activeFriend) {
        await sendDirectMessage(activeFriend._id, payload);
        showToast(`Itinerary shared with ${activeFriend.name}!`, 'success');
        await loadDirectMessages(true);
      } else if (chatSubMode === 'groups' && activeCustomGroup) {
        await sendGroupMessage(activeCustomGroup._id, payload);
        showToast(`Itinerary shared with ${activeCustomGroup.name}!`, 'success');
        await loadGroupMessages(true);
      }

      setTripModalOpen(false);
      scrollChatToBottom();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to share trip', 'error');
    }
  };

  const handleAcceptJoinTrip = async (tripId, tripTitle) => {
    if (!user) {
      showToast('Please login to join this trip', 'warning');
      navigate('/login');
      return;
    }
    setJoiningTripId(tripId);
    try {
      const res = await joinTripInvitation(tripId);
      const updatedParty = res.data?.travelerPartyType || 'Group Expedition';
      showToast(`🎉 You joined "${tripTitle}"! Upgraded to ${updatedParty}!`, 'success');
      if (chatSubMode === 'direct') loadDirectMessages(true);
      if (chatSubMode === 'groups') loadGroupMessages(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to join trip', 'error');
    } finally {
      setJoiningTripId(null);
    }
  };

  const totalUnreadCount = friendsList.reduce((acc, f) => acc + (f.unreadCount || 0), 0);
  const pendingRequestsCount = incomingRequests.length;
  const ActiveIcon = activeGroup.icon;

  const activeChatMessages = chatSubMode === 'direct' ? directMessages : groupMessages;
  const activeChatLoading = chatSubMode === 'direct' ? loadingDMs : loadingGroupDMs;

  const filteredCircles = allTripCircles.filter((c) => {
    if (!circleSearchQuery) return true;
    const q = circleSearchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q);
  });

  return (
    <div className="w-full min-h-screen bg-background text-foreground py-6 px-3 sm:px-6 font-sans select-none">
      <div className="max-w-[1440px] mx-auto space-y-4">
        {/* Header bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-2xl bg-[#121215] border border-border/80 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight font-heading">
                {t('communityHub')}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] font-bold border border-orange-500/30 flex items-center gap-1">
                <Sparkles className="size-2.5" />
                <span>Live Hub</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Discuss with local residents, chat 1-on-1, create travel friend groups & explore community itineraries.
            </p>
          </div>

          {/* Navigation Tab buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#18181b] border border-border/80 self-stretch md:self-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border shrink-0 ${
                activeTab === 'chat'
                  ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-xs'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <Globe className="size-3.5" />
              <span>{t('publicLounges')}</span>
            </button>

            {/* TAB 2: TRIP & DESTINATION CIRCLES (Restricted to Residents & Journey Travelers) */}
            <button
              onClick={() => setActiveTab('trip_circles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border shrink-0 relative ${
                activeTab === 'trip_circles'
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 shadow-xs'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <MapPin className="size-3.5 text-emerald-400" />
              <span>{t('tripCircles')}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                Verified
              </span>
            </button>

            <button
              onClick={() => {
                if (!user) {
                  showToast('Please login to access Friend Chat & Groups', 'warning');
                  navigate('/login');
                  return;
                }
                setActiveTab('friends_chat');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border shrink-0 relative ${
                activeTab === 'friends_chat'
                  ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-xs'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <MessageSquare className="size-3.5" />
              <span>{t('friendsGroups')}</span>
              {totalUnreadCount > 0 && (
                <span className="size-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {totalUnreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (!user) {
                  showToast('Please login to find and add friends', 'warning');
                  navigate('/login');
                  return;
                }
                setActiveTab('find_friends');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border shrink-0 relative ${
                activeTab === 'find_friends'
                  ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-xs'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <UserPlus className="size-3.5" />
              <span>{t('findFriends')}</span>
              {pendingRequestsCount > 0 && (
                <span className="size-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('itineraries')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border shrink-0 ${
                activeTab === 'itineraries'
                  ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-xs'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <Compass className="size-3.5" />
              <span>{t('publicTrips')}</span>
            </button>
          </div>
        </div>

        {/* --- TAB 1: GROUP CHAT LOUNGES --- */}
        {activeTab === 'chat' && (
          <div className="rounded-2xl bg-[#121215] border border-border/80 overflow-hidden shadow-lg h-[calc(100vh-210px)] min-h-[560px] flex flex-col md:flex-row">
            <div
              className={`w-full md:w-80 lg:w-96 border-r border-border/80 flex flex-col bg-[#0f0f12] shrink-0 ${
                mobileShowChat ? 'hidden md:flex' : 'flex'
              }`}
            >
              <div className="p-3.5 border-b border-border/80">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Public Travel Channels
                </span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
                {COMMUNITY_GROUPS.map((grp) => {
                  const Icon = grp.icon;
                  const isSelected = activeGroup.id === grp.id;
                  return (
                    <button
                      key={grp.id}
                      onClick={() => handleGroupSelect(grp)}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500/15 border border-orange-500/30 shadow-xs'
                          : 'hover:bg-secondary/40 border border-transparent'
                      }`}
                    >
                      <div
                        className={`size-10 rounded-xl flex items-center justify-center shrink-0 border ${grp.badgeColor}`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-foreground truncate">{grp.name}</h4>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{grp.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Chat Lounge Messages */}
            <div className={`flex-1 flex flex-col bg-[#121215] min-w-0 ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
              <div className="p-3.5 border-b border-border/80 flex items-center justify-between bg-[#141418]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <ArrowRight className="size-4 rotate-180" />
                  </button>
                  <div
                    className={`size-9 rounded-xl flex items-center justify-center shrink-0 border ${activeGroup.badgeColor}`}
                  >
                    <ActiveIcon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-foreground truncate">{activeGroup.name}</h3>
                    <p className="text-[10px] text-muted-foreground truncate">{activeGroup.desc}</p>
                  </div>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {loadingMessages ? (
                  <div className="py-20 flex items-center justify-center">
                    <Loader text="Loading live lounge messages..." />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center space-y-2">
                    <MessageSquare className="size-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs text-muted-foreground">No messages in this lounge yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAuthor = user && (msg.user?._id === user._id || msg.user === user._id);
                    const isLiked = user && msg.likes?.includes(user._id);

                    return (
                      <div key={msg._id} className="flex items-start gap-3 group">
                        <div
                          onClick={() => handleViewUserProfile(msg.user)}
                          className="size-9 rounded-xl border border-border overflow-hidden bg-secondary shrink-0 cursor-pointer hover:border-orange-500/60 transition-colors"
                          title="View Traveler Profile"
                        >
                          <img
                            src={
                              msg.user?.avatar?.url ||
                              msg.user?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={msg.user?.name || 'Traveler'}
                            className="size-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => handleViewUserProfile(msg.user)}
                              className="text-xs font-bold text-foreground cursor-pointer hover:text-orange-400 transition-colors"
                            >
                              {msg.user?.name || 'Traveler'}
                            </span>
                            {msg.user?.role === 'admin' && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[9px] font-bold border border-amber-500/30 flex items-center gap-0.5">
                                <Crown className="size-2.5" />
                                <span>Admin</span>
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#18181c] border border-border/80 inline-block max-w-2xl text-xs text-foreground leading-relaxed shadow-xs">
                            {renderFormattedText(msg.text)}

                            {msg.images && msg.images.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                {msg.images.map((imgUrl, i) => (
                                  <img
                                    key={i}
                                    src={imgUrl}
                                    alt="attachment"
                                    onClick={() => setPreviewModalImg(imgUrl)}
                                    className="rounded-xl object-cover h-28 w-full border border-border/60 cursor-pointer hover:opacity-90 transition-opacity"
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                            <button
                              onClick={() => handleLike(msg._id)}
                              className={`flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer ${
                                isLiked ? 'text-rose-400 font-bold' : ''
                              }`}
                            >
                              <Heart className={`size-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
                              <span>{msg.likes?.length || 0}</span>
                            </button>

                            {isAuthor && (
                              <button
                                onClick={() => handleDeleteMyMessage(msg)}
                                className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all cursor-pointer text-[10px]"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#141418] border-t border-border/80 space-y-2">
                {imagePreviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative size-14 rounded-xl border border-border overflow-hidden">
                        <img src={preview} alt="preview" className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(idx)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-600"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    <ImageIcon className="size-4" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Write a message in lounge..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500/60"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!inputText.trim() && selectedImages.length === 0)}
                    className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- TAB 2: TRIP & DESTINATION CIRCLES (Restricted to Residents & Active Journey Travelers) --- */}
        {activeTab === 'trip_circles' && (
          <div className="rounded-2xl bg-[#121215] border border-border/80 overflow-hidden shadow-lg h-[calc(100vh-210px)] min-h-[560px] flex flex-col md:flex-row">
            {/* Sidebar with Filterable Trips & Destinations */}
            <div
              className={`w-full md:w-80 lg:w-96 border-r border-border/80 flex flex-col bg-[#0f0f12] shrink-0 ${
                mobileShowChat ? 'hidden md:flex' : 'flex'
              }`}
            >
              <div className="p-3.5 border-b border-border/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-emerald-400" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Destination & Trip Hubs
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    Locals & Travelers
                  </span>
                </div>

                <div className="relative">
                  <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={circleSearchQuery}
                    onChange={(e) => setCircleSearchQuery(e.target.value)}
                    placeholder="Search destination or trip name..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              {/* Circle List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
                {filteredCircles.map((circle) => {
                  const isSelected = selectedTripCircle?.id === circle.id;
                  const isMyTrip = circle.isMyTrip;
                  const isTrip = circle.isTrip;

                  return (
                    <button
                      key={circle.id}
                      onClick={() => {
                        setSelectedTripCircle(circle);
                        setMobileShowChat(true);
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border border-emerald-500/40 shadow-xs'
                          : 'hover:bg-secondary/40 border border-transparent'
                      }`}
                    >
                      <div className="size-11 rounded-xl border border-border/80 overflow-hidden shrink-0 relative bg-secondary">
                        <img src={circle.coverImage} alt={circle.name} className="size-full object-cover" />
                        {circle.flag && (
                          <span className="absolute bottom-0.5 right-0.5 text-xs drop-shadow-md">
                            {circle.flag}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-foreground truncate">{circle.name}</h4>
                          {isMyTrip ? (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold shrink-0">
                              👑 My Trip
                            </span>
                          ) : isTrip ? (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold shrink-0">
                              ✈️ Trip
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{circle.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Destination Discussion Room */}
            <div className={`flex-1 flex flex-col bg-[#121215] min-w-0 ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
              {/* Room Header with verified status indicator */}
              <div className="p-3.5 border-b border-border/80 flex items-center justify-between bg-[#141418]">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <ArrowRight className="size-4 rotate-180" />
                  </button>

                  <div className="size-10 rounded-xl border border-border/80 overflow-hidden shrink-0">
                    <img
                      src={selectedTripCircle?.coverImage}
                      alt={selectedTripCircle?.name}
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {selectedTripCircle?.name}
                      </h3>
                      {circleEligibility.canPost ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 shrink-0">
                          <ShieldCheck className="size-3" />
                          <span>
                            {circleEligibility.reason === 'resident'
                              ? t('residentBadge')
                              : circleEligibility.reason === 'creator'
                              ? t('creatorBadge')
                              : t('travelerBadge')}
                          </span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 shrink-0">
                          <Lock className="size-3" />
                          <span>Restricted (Read-Only)</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {selectedTripCircle?.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {loadingTripCircleMessages ? (
                  <div className="py-20 flex items-center justify-center">
                    <Loader text="Loading destination circle discussions..." />
                  </div>
                ) : tripCircleMessages.length === 0 ? (
                  <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border/80 p-8 max-w-lg mx-auto">
                    <MapPin className="size-10 text-emerald-400/40 mx-auto" />
                    <h4 className="text-sm font-bold text-foreground">
                      Welcome to {selectedTripCircle?.name} Circle
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This dedicated discussion forum is exclusive for local residents living in {selectedTripCircle?.city || selectedTripCircle?.name} and verified travelers with an active planned journey here.
                    </p>
                  </div>
                ) : (
                  tripCircleMessages.map((msg) => {
                    const isAuthor = user && (msg.user?._id === user._id || msg.user === user._id);
                    const isLiked = user && msg.likes?.includes(user._id);

                    return (
                      <div key={msg._id} className="flex items-start gap-3 group">
                        <div
                          onClick={() => handleViewUserProfile(msg.user)}
                          className="size-9 rounded-xl border border-border overflow-hidden bg-secondary shrink-0 cursor-pointer hover:border-emerald-500/60 transition-colors"
                          title="View Traveler Profile"
                        >
                          <img
                            src={
                              msg.user?.avatar?.url ||
                              msg.user?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={msg.user?.name || 'Traveler'}
                            className="size-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              onClick={() => handleViewUserProfile(msg.user)}
                              className="text-xs font-bold text-foreground cursor-pointer hover:text-emerald-400 transition-colors"
                            >
                              {msg.user?.name || 'Traveler'}
                            </span>

                            {/* Verified Author Badges */}
                            {msg.authorBadge === 'resident' && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-bold border border-emerald-500/30 flex items-center gap-0.5">
                                <HomeIcon className="size-2.5" />
                                <span>{t('residentBadge')}</span>
                              </span>
                            )}
                            {msg.authorBadge === 'traveler' && (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-400 text-[9px] font-bold border border-cyan-500/30 flex items-center gap-0.5">
                                <Plane className="size-2.5" />
                                <span>{t('travelerBadge')}</span>
                              </span>
                            )}
                            {msg.authorBadge === 'creator' && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[9px] font-bold border border-amber-500/30 flex items-center gap-0.5">
                                <Crown className="size-2.5" />
                                <span>{t('creatorBadge')}</span>
                              </span>
                            )}
                            {msg.user?.role === 'admin' && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 text-[9px] font-bold border border-purple-500/30 flex items-center gap-0.5">
                                <ShieldCheck className="size-2.5" />
                                <span>Admin</span>
                              </span>
                            )}

                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#18181c] border border-border/80 inline-block max-w-2xl text-xs text-foreground leading-relaxed shadow-xs">
                            {renderFormattedText(msg.text)}

                            {msg.images && msg.images.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                {msg.images.map((imgUrl, i) => (
                                  <img
                                    key={i}
                                    src={imgUrl}
                                    alt="attachment"
                                    onClick={() => setPreviewModalImg(imgUrl)}
                                    className="rounded-xl object-cover h-28 w-full border border-border/60 cursor-pointer hover:opacity-90 transition-opacity"
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                            <button
                              onClick={() => handleLikeCircleMessage(msg._id)}
                              className={`flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer ${
                                isLiked ? 'text-rose-400 font-bold' : ''
                              }`}
                            >
                              <Heart className={`size-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
                              <span>{msg.likes?.length || 0}</span>
                            </button>

                            {isAuthor && (
                              <button
                                onClick={() => handleDeleteMyMessage(msg)}
                                className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all cursor-pointer text-[10px]"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={tripCircleMessagesEndRef} />
              </div>

              {/* Bottom Input Area: ACTIVE if Eligible, or RESTRICTION BANNER if Ineligible */}
              {circleEligibility.canPost ? (
                <form onSubmit={handleSendTripCircleMessage} className="p-3 bg-[#141418] border-t border-border/80 space-y-2">
                  {tripCircleImagePreviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      {tripCircleImagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative size-14 rounded-xl border border-border overflow-hidden">
                          <img src={preview} alt="preview" className="size-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeTripCircleImage(idx)}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-600"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                      <ImageIcon className="size-4" />
                      <input
                        ref={tripCircleFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleTripCircleImageSelect}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      value={tripCircleInputText}
                      onChange={(e) => setTripCircleInputText(e.target.value)}
                      placeholder={t('typeMessage')}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/60"
                    />

                    <button
                      type="submit"
                      disabled={tripCircleSending || (!tripCircleInputText.trim() && tripCircleSelectedImages.length === 0)}
                      className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 bg-gradient-to-r from-amber-950/40 via-[#18181c] to-zinc-900 border-t border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="size-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                      <ShieldAlert className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-amber-300">
                        {t('restrictedRoom')}
                      </h4>
                      <p className="text-[11px] text-muted-foreground max-w-lg leading-relaxed">
                        {t('restrictedNotice')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate('/profile')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <MapPin className="size-3.5" />
                      <span>{t('updateProfileBtn')}</span>
                    </button>

                    <button
                      onClick={() =>
                        navigate('/create', {
                          state: { initialPrompt: `5 days trip to ${selectedTripCircle?.name}` }
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Plane className="size-3.5" />
                      <span>{t('planTripBtn')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 3: FRIENDS & GROUPS CHAT --- */}
        {activeTab === 'friends_chat' && (
          <div className="rounded-2xl bg-[#121215] border border-border/80 overflow-hidden shadow-lg h-[calc(100vh-210px)] min-h-[560px] flex flex-col md:flex-row">
            <div
              className={`w-full md:w-80 lg:w-96 border-r border-border/80 flex flex-col bg-[#0f0f12] shrink-0 ${
                mobileShowChat ? 'hidden md:flex' : 'flex'
              }`}
            >
              <div className="p-3 border-b border-border/80 flex items-center justify-between bg-[#121215]">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#18181b] border border-border/60">
                  <button
                    onClick={() => setChatSubMode('direct')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chatSubMode === 'direct'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Direct (1-on-1)
                  </button>
                  <button
                    onClick={() => setChatSubMode('groups')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chatSubMode === 'groups'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Groups
                  </button>
                </div>

                {chatSubMode === 'groups' && (
                  <button
                    onClick={() => setCreateGroupModalOpen(true)}
                    className="p-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white cursor-pointer transition-colors shadow-xs"
                    title="Create New Friend Group"
                  >
                    <Plus className="size-4" />
                  </button>
                )}
              </div>

              {/* Friends or Groups Sidebar List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
                {chatSubMode === 'direct' ? (
                  loadingFriends ? (
                    <div className="py-12 text-center">
                      <Loader text="Loading friends..." />
                    </div>
                  ) : friendsList.length === 0 ? (
                    <div className="py-12 text-center space-y-2 p-4">
                      <Users className="size-8 text-muted-foreground/30 mx-auto" />
                      <p className="text-xs text-muted-foreground">No friends added yet.</p>
                      <button
                        onClick={() => setActiveTab('find_friends')}
                        className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
                      >
                        Find Friends Now
                      </button>
                    </div>
                  ) : (
                    friendsList.map((item) => {
                      const friend = item.friend;
                      const isSelected = activeFriend?._id === friend?._id;

                      return (
                        <button
                          key={item.friendshipId}
                          onClick={() => {
                            setActiveFriend(friend);
                            setMobileShowChat(true);
                          }}
                          className={`w-full p-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-orange-500/15 border border-orange-500/30 shadow-xs'
                              : 'hover:bg-secondary/40 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-10 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                              <img
                                src={
                                  friend?.avatar?.url ||
                                  friend?.avatar ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                                }
                                alt={friend?.name}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-foreground truncate">{friend?.name}</h4>
                              <p className="text-[10px] text-muted-foreground truncate">{friend?.email}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )
                ) : loadingGroups ? (
                  <div className="py-12 text-center">
                    <Loader text="Loading groups..." />
                  </div>
                ) : friendGroups.length === 0 ? (
                  <div className="py-12 text-center space-y-2 p-4">
                    <Users className="size-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs text-muted-foreground">No groups created yet.</p>
                    <button
                      onClick={() => setCreateGroupModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
                    >
                      Create First Group
                    </button>
                  </div>
                ) : (
                  friendGroups.map((grp) => {
                    const isSelected = activeCustomGroup?._id === grp._id;
                    return (
                      <button
                        key={grp._id}
                        onClick={() => {
                          setActiveCustomGroup(grp);
                          setMobileShowChat(true);
                        }}
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500/15 border border-orange-500/30 shadow-xs'
                            : 'hover:bg-secondary/40 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                            <Users className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate">{grp.name}</h4>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {grp.members?.length || 0} members
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Active Direct / Group Chat Stream */}
            <div className={`flex-1 flex flex-col bg-[#121215] min-w-0 ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
              <div className="p-3.5 border-b border-border/80 flex items-center justify-between bg-[#141418]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <ArrowRight className="size-4 rotate-180" />
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-foreground truncate">
                      {chatSubMode === 'direct'
                        ? activeFriend
                          ? `Chat with ${activeFriend.name}`
                          : 'Select a friend to start chatting'
                        : activeCustomGroup
                        ? activeCustomGroup.name
                        : 'Select a group to start chatting'}
                    </h3>
                  </div>
                </div>

                {/* Share Itinerary Button */}
                {(activeFriend || activeCustomGroup) && (
                  <button
                    onClick={() => setTripModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-border/80 transition-colors"
                  >
                    <Plane className="size-3.5 text-orange-400" />
                    <span>Share Trip</span>
                  </button>
                )}
              </div>

              {/* Chat Stream Messages */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3.5">
                {activeChatLoading ? (
                  <div className="py-20 flex items-center justify-center">
                    <Loader text="Loading conversation..." />
                  </div>
                ) : activeChatMessages.length === 0 ? (
                  <div className="py-20 text-center space-y-2">
                    <MessageSquare className="size-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs text-muted-foreground">No messages here yet. Send a greeting or itinerary!</p>
                  </div>
                ) : (
                  activeChatMessages.map((msg) => {
                    const sender = msg.sender || msg.user;
                    const isMe = user && (sender?._id === user._id || sender === user._id);

                    return (
                      <div
                        key={msg._id}
                        className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className="size-8 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                          <img
                            src={
                              sender?.avatar?.url ||
                              sender?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={sender?.name || 'User'}
                            className="size-full object-cover"
                          />
                        </div>

                        <div className={`space-y-1 max-w-md ${isMe ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-orange-500 text-white rounded-tr-sm'
                                : 'bg-[#18181c] text-foreground border border-border/80 rounded-tl-sm'
                            }`}
                          >
                            <p>{renderFormattedText(msg.text)}</p>

                            {/* Shared Trip Card in Chat */}
                            {msg.sharedTrip && (
                              <div className="mt-2.5 p-3 rounded-xl bg-black/40 border border-white/15 space-y-2 text-left">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                                    Shared Itinerary
                                  </span>
                                  <span className="text-[10px] text-white/70">
                                    {msg.sharedTrip.durationDays || 3} Days
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-white line-clamp-1">{msg.sharedTrip.title}</h4>
                                <div className="flex items-center justify-between pt-1">
                                  <button
                                    onClick={() => navigate(`/itinerary/${msg.sharedTrip._id}`)}
                                    className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-colors cursor-pointer"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => handleAcceptJoinTrip(msg.sharedTrip._id, msg.sharedTrip.title)}
                                    disabled={joiningTripId === msg.sharedTrip._id}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition-colors cursor-pointer"
                                  >
                                    {joiningTripId === msg.sharedTrip._id ? 'Joining...' : 'Join Trip'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] text-muted-foreground font-mono block px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Chat Input */}
              {(activeFriend || activeCustomGroup) && (
                <form
                  onSubmit={handleSendChatStreamMessage}
                  className="p-3 bg-[#141418] border-t border-border/80 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder={`Type a message to ${
                        chatSubMode === 'direct' ? activeFriend?.name : activeCustomGroup?.name
                      }...`}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500/60"
                    />

                    <button
                      type="submit"
                      disabled={chatSending || !chatInputText.trim()}
                      className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 4: FIND FRIENDS & REQUESTS --- */}
        {activeTab === 'find_friends' && (
          <div className="rounded-2xl bg-[#121215] border border-border/80 p-6 space-y-6 shadow-lg min-h-[560px]">
            <div className="flex items-center justify-between pb-4 border-b border-border/80 flex-wrap gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#18181b] border border-border/80">
                <button
                  onClick={() => setFriendsFilter('search')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    friendsFilter === 'search'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Search Explorers
                </button>
                <button
                  onClick={() => setFriendsFilter('requests')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                    friendsFilter === 'requests'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Requests ({incomingRequests.length})
                </button>
                <button
                  onClick={() => setFriendsFilter('my_friends')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    friendsFilter === 'my_friends'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  My Friends ({friendsList.length})
                </button>
              </div>
            </div>

            {/* SEARCH VIEW */}
            {friendsFilter === 'search' && (
              <div className="space-y-4">
                <form onSubmit={handleSearchUsers} className="flex gap-2 max-w-md">
                  <div className="relative flex-1">
                    <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type name or email to find travelers..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500/60"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </form>

                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {searchResults.map((u) => (
                      <div
                        key={u._id}
                        className="p-4 rounded-2xl bg-[#16161a] border border-border/80 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                            <img
                              src={
                                u.avatar?.url ||
                                u.avatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                              }
                              alt={u.name}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate">{u.name}</h4>
                            <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSendRequest(u._id)}
                          disabled={actionLoadingId === u._id}
                          className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <UserPlus className="size-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border/80 p-8">
                    <UserPlus className="size-10 text-muted-foreground/30 mx-auto" />
                    <h4 className="text-sm font-bold text-foreground">Find Travel Buddies</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Search any traveler by name or email to send a friend request, create friend groups, and share itineraries.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* REQUESTS VIEW */}
            {friendsFilter === 'requests' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Incoming Requests ({incomingRequests.length})
                  </h3>

                  {incomingRequests.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No incoming friend requests.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {incomingRequests.map((req) => (
                        <div
                          key={req._id}
                          className="p-4 rounded-2xl bg-[#16161a] border border-border/80 flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-10 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                              <img
                                src={
                                  req.requester?.avatar?.url ||
                                  req.requester?.avatar ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                                }
                                alt={req.requester?.name}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-foreground truncate">{req.requester?.name}</h4>
                              <p className="text-[10px] text-muted-foreground truncate">{req.requester?.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleRespondRequest(req._id, 'accept')}
                              disabled={actionLoadingId === req._id}
                              className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer transition-colors"
                              title="Accept Request"
                            >
                              <Check className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleRespondRequest(req._id, 'reject')}
                              disabled={actionLoadingId === req._id}
                              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 cursor-pointer transition-colors"
                              title="Decline Request"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MY FRIENDS VIEW */}
            {friendsFilter === 'my_friends' && (
              <div className="space-y-3">
                {friendsList.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Users className="size-10 text-muted-foreground/30 mx-auto" />
                    <h4 className="text-sm font-bold text-foreground">No Friends Yet</h4>
                    <p className="text-xs text-muted-foreground">Search and connect with global travelers.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {friendsList.map((item) => {
                      const friend = item.friend;
                      return (
                        <div
                          key={item.friendshipId}
                          className="p-4 rounded-2xl bg-[#16161a] border border-border/80 flex items-center justify-between gap-3 shadow-xs hover:border-orange-500/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-10 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                              <img
                                src={
                                  friend?.avatar?.url ||
                                  friend?.avatar ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                                }
                                alt={friend?.name}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-foreground truncate">{friend?.name}</h4>
                              <p className="text-[10px] text-muted-foreground truncate">{friend?.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleStartChatWithFriend(friend)}
                              className="px-2.5 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <MessageSquare className="size-3" />
                              <span>Chat</span>
                            </button>

                            <button
                              onClick={() => handleRemoveFriend(item.friendshipId, friend?.name)}
                              className="p-1.5 rounded-xl hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                              title="Unfriend"
                            >
                              <UserX className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 5: PUBLIC ITINERARIES --- */}
        {activeTab === 'itineraries' && (
          <div className="space-y-4">
            {loadingTrips ? (
              <div className="py-20 flex items-center justify-center">
                <Loader text="Loading public community itineraries..." />
              </div>
            ) : publicTrips.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#121215] border border-border/80 space-y-2">
                <Compass className="size-10 text-muted-foreground/30 mx-auto" />
                <h3 className="text-sm font-bold text-foreground">No Public Trips Yet</h3>
                <p className="text-xs text-muted-foreground">
                  Be the first traveler to create and publish an itinerary to the community.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicTrips.map((trip) => (
                  <div
                    key={trip._id}
                    className="p-4 rounded-2xl bg-[#121215] border border-border/80 flex flex-col justify-between gap-3 shadow-sm hover:border-orange-500/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                          {trip.destination?.country || trip.destinationCountry || 'Global'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {trip.durationDays || trip.days?.length || 3} Days
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-foreground line-clamp-1">{trip.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{trip.overview || trip.description}</p>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                        <MapPin className="size-3 text-orange-400 shrink-0" />
                        <span className="truncate">{trip.destination?.city || trip.destinationCity || 'Destination'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenTripDiscussion(trip)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Open Local Discussion Room"
                        >
                          <MessageCircle className="size-3" />
                          <span>Discuss</span>
                        </button>

                        <button
                          onClick={() => navigate(`/itinerary/${trip._id}`)}
                          className="px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>View</span>
                          <ArrowRight className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL: CREATE WHATSAPP-STYLE FRIEND GROUP --- */}
      {createGroupModalOpen && (
        <div
          onClick={() => setCreateGroupModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-border bg-[#141417] p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-orange-400" />
                <h3 className="text-sm font-bold text-foreground">Create New Travel Friend Group</h3>
              </div>
              <button
                onClick={() => setCreateGroupModalOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Group Name *</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Tokyo Expedition 2026, Euro Backpackers"
                  className="w-full px-3.5 h-10 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Group Description</label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="e.g. Co-planning our summer vacation"
                  className="w-full px-3.5 h-10 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60"
                />
              </div>

              {/* Friend Multi-Select List */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">
                  Select Friends to Add ({selectedMemberIds.length} selected) *
                </label>

                <div className="max-h-48 overflow-y-auto custom-scrollbar rounded-xl border border-border/80 bg-[#18181b] divide-y divide-border/40 p-1">
                  {friendsList.map((item) => {
                    const friend = item.friend;
                    const isSelected = selectedMemberIds.includes(friend._id);
                    return (
                      <div
                        key={friend._id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMemberIds((prev) => prev.filter((id) => id !== friend._id));
                          } else {
                            setSelectedMemberIds((prev) => [...prev, friend._id]);
                          }
                        }}
                        className={`p-2.5 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-orange-500/15' : 'hover:bg-secondary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-8 rounded-lg border border-border overflow-hidden bg-secondary shrink-0">
                            <img
                              src={
                                friend.avatar?.url ||
                                friend.avatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                              }
                              alt={friend.name}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{friend.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{friend.email}</p>
                          </div>
                        </div>

                        <div
                          className={`size-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-border/80 bg-background'
                          }`}
                        >
                          {isSelected && <Check className="size-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <GlowingButton
                  type="submit"
                  disabled={creatingGroup || !newGroupName.trim() || selectedMemberIds.length === 0}
                  size="md"
                  innerClassName="w-full h-10 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Users className="size-3.5" />
                  <span>{creatingGroup ? 'Creating Group...' : 'Create Travel Group'}</span>
                </GlowingButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: SHARE GENERATED TRIP IN DIRECT CHAT OR GROUP --- */}
      {tripModalOpen && (
        <div
          onClick={() => setTripModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-border bg-[#141417] p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <Plane className="size-4 text-orange-400" />
                <h3 className="text-sm font-bold text-foreground">
                  Share Your Itinerary with{' '}
                  {chatSubMode === 'direct' ? activeFriend?.name : activeCustomGroup?.name}
                </h3>
              </div>
              <button
                onClick={() => setTripModalOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
              {loadingMyTrips ? (
                <div className="py-12 text-center">
                  <Loader text="Loading your trips..." />
                </div>
              ) : myTrips.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <Plane className="size-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground">You haven&apos;t generated any trips yet.</p>
                  <button
                    onClick={() => {
                      setTripModalOpen(false);
                      navigate('/create');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
                  >
                    Create a Trip with AI
                  </button>
                </div>
              ) : (
                myTrips.map((trip) => (
                  <div
                    key={trip._id}
                    className="p-3.5 rounded-xl bg-[#1a1a1f] border border-border/80 flex items-center justify-between gap-3 hover:border-orange-500/50 transition-colors"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-foreground truncate">{trip.title}</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="size-3 text-orange-400" />
                        <span>{trip.destination?.city || trip.destinationCity || 'Destination'}</span>
                        <span>•</span>
                        <span>{trip.days?.length || trip.durationDays || 3} Days</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleShareTripInChat(trip)}
                      className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
                    >
                      <Share2 className="size-3" />
                      <span>Send</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: TRAVELER PROFILE INSPECTION & FRIEND REQUEST --- */}
      {profileModalOpen && selectedProfileUser && (
        <div
          onClick={() => setProfileModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-[#141418] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header Banner */}
            <div className="h-24 bg-gradient-to-r from-orange-500/20 via-orange-600/30 to-amber-500/20 relative p-4 flex items-start justify-between border-b border-border/60">
              <span className="px-2.5 py-0.5 rounded-full bg-black/50 text-orange-400 text-[10px] font-bold border border-orange-500/30 backdrop-blur-sm flex items-center gap-1">
                <Globe className="size-3" />
                <span>WanderSync Traveler</span>
              </span>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="size-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-5 pt-0 space-y-4 relative">
              <div className="relative -mt-12 mb-2 inline-block">
                <div className="size-20 rounded-2xl border-4 border-[#141418] overflow-hidden bg-secondary shadow-lg">
                  <img
                    src={
                      selectedProfileUser.avatar?.url ||
                      selectedProfileUser.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={selectedProfileUser.name}
                    className="size-full object-cover"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-foreground">{selectedProfileUser.name}</h3>
                  {selectedProfileUser.role === 'admin' ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                      <Crown className="size-3 text-amber-400" />
                      <span>Admin</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                      Traveler
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedProfileUser.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#1a1a1f] border border-border/80 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Travel Style
                  </span>
                  <span className="font-semibold text-foreground capitalize mt-0.5 block">
                    {selectedProfileUser.preferences?.travelStyle || 'Global Explorer'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Resident Location
                  </span>
                  <span className="font-semibold text-emerald-400 mt-0.5 block truncate">
                    {selectedProfileUser.preferences?.homeLocation || 'Global Resident'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                {user?._id === selectedProfileUser._id ? (
                  <button
                    onClick={() => {
                      setProfileModalOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-colors cursor-pointer"
                  >
                    View Your Own Profile
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleSendRequest(selectedProfileUser._id);
                      setProfileModalOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <UserPlus className="size-3.5" />
                    <span>Send Friend Request</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- IMAGE ENLARGE PREVIEW MODAL --- */}
      {previewModalImg && (
        <div
          onClick={() => setPreviewModalImg(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-border bg-[#121215]">
            <img src={previewModalImg} alt="enlarged preview" className="max-h-[80vh] w-auto object-contain" />
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
