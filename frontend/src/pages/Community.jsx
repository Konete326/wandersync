import { useState, useEffect, useRef } from 'react';
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
  Pin,
  Compass,
  ArrowRight,
  ShieldCheck,
  Crown,
  X,
  Eye,
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Check,
  Share2,
  Clock,
  ExternalLink,
  DollarSign,
  Plus,
  CheckCircle2,
  Smile,
  Flame
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

const GROUP_ICON_OPTIONS = [
  { name: 'Users', icon: Users, label: 'Friends Squad' },
  { name: 'Plane', icon: Plane, label: 'Flight Crew' },
  { name: 'Compass', icon: Compass, label: 'Expedition' },
  { name: 'Globe', icon: Globe, label: 'World Travelers' },
  { name: 'Sparkles', icon: Sparkles, label: 'VIP Party' },
  { name: 'Building', icon: Building, label: 'City Stays' }
];

export default function Community() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showModal, showToast } = useModal();

  // Navigation tabs: 'chat' | 'friends_chat' | 'find_friends' | 'itineraries'
  const [activeTab, setActiveTab] = useState('chat');
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
  const [mentionTarget, setMentionTarget] = useState(null); // 'lounge' | 'chat'

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

  // Helper to find candidate users for @mention
  const getMentionSuggestions = (query) => {
    if (query === null || query === undefined) return [];
    const q = query.toLowerCase();
    const pool = [];

    friendsList.forEach((f) => {
      if (f.friend && !pool.some((p) => p._id === f.friend._id)) {
        pool.push(f.friend);
      }
    });

    if (activeCustomGroup?.members) {
      activeCustomGroup.members.forEach((m) => {
        if (m.user && m.user._id !== user?._id && !pool.some((p) => p._id === m.user._id)) {
          pool.push(m.user);
        }
      });
    }

    messages.forEach((m) => {
      if (m.user && m.user._id !== user?._id && !pool.some((p) => p._id === m.user._id)) {
        pool.push(m.user);
      }
    });

    return pool.filter((u) => u.name && u.name.toLowerCase().includes(q)).slice(0, 6);
  };

  const handleLoungeInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const atMatch = textBeforeCursor.match(/@([a-zA-Z0-9_ -]*)$/);

    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionTarget('lounge');
    } else {
      setMentionQuery(null);
    }
  };

  const handleChatInputChange = (e) => {
    const val = e.target.value;
    setChatInputText(val);

    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const atMatch = textBeforeCursor.match(/@([a-zA-Z0-9_ -]*)$/);

    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionTarget('chat');
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (targetUser) => {
    if (mentionTarget === 'lounge') {
      const atMatch = inputText.match(/@([a-zA-Z0-9_ -]*)$/);
      if (atMatch) {
        const replaced = inputText.slice(0, atMatch.index) + `@${targetUser.name} `;
        setInputText(replaced);
      } else {
        setInputText((prev) => `${prev}@${targetUser.name} `);
      }
    } else if (mentionTarget === 'chat') {
      const atMatch = chatInputText.match(/@([a-zA-Z0-9_ -]*)$/);
      if (atMatch) {
        const replaced = chatInputText.slice(0, atMatch.index) + `@${targetUser.name} `;
        setChatInputText(replaced);
      } else {
        setChatInputText((prev) => `${prev}@${targetUser.name} `);
      }
    }
    setMentionQuery(null);
    setMentionTarget(null);
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

  // --- Friends List Loading ---
  const loadFriends = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoadingFriends(true);
    try {
      const res = await fetchFriendsList();
      if (res.data) {
        setFriendsList(res.data);
        if (!activeFriend && res.data.length > 0 && chatSubMode === 'direct') {
          setActiveFriend(res.data[0].friend);
        }
      }
    } catch {
    } finally {
      if (!silent) setLoadingFriends(false);
    }
  };

  // --- Custom Friend Groups Loading ---
  const loadFriendGroups = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoadingGroups(true);
    try {
      const res = await fetchFriendGroups();
      if (res.data) {
        setFriendGroups(res.data);
        if (!activeCustomGroup && res.data.length > 0 && chatSubMode === 'groups') {
          setActiveCustomGroup(res.data[0]);
        }
      }
    } catch {
    } finally {
      if (!silent) setLoadingGroups(false);
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

  // --- Direct Messages Loading ---
  const loadDirectMessages = async (silent = false) => {
    if (!user || !activeFriend || chatSubMode !== 'direct') return;
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

  // --- Group Messages Loading ---
  const loadGroupMessages = async (silent = false) => {
    if (!user || !activeCustomGroup || chatSubMode !== 'groups') return;
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

  // --- Load User's Generated Trips for Sharing ---
  const loadUserTrips = async () => {
    if (!user) return;
    setLoadingMyTrips(true);
    try {
      const res = await getMyTrips();
      if (res.data) {
        setMyTrips(res.data);
      }
    } catch {
      showToast('Could not load your trips', 'error');
    } finally {
      setLoadingMyTrips(false);
    }
  };

  // Parse URL Search Parameters (e.g. from Bell Notifications)
  useEffect(() => {
    const tab = searchParams.get('tab');
    const friendId = searchParams.get('friendId');
    const groupId = searchParams.get('groupId');

    if (tab) {
      setActiveTab(tab);
    }

    if (friendId) {
      setActiveTab('friends_chat');
      setChatSubMode('direct');
      setMobileShowChat(true);
      const found = friendsList.find((f) => f.friend?._id === friendId);
      if (found) {
        setActiveFriend(found.friend);
      } else {
        setActiveFriend({ _id: friendId, name: 'Travel Friend' });
      }
    } else if (groupId) {
      setActiveTab('friends_chat');
      setChatSubMode('groups');
      setMobileShowChat(true);
      const foundGroup = friendGroups.find((g) => g._id === groupId);
      if (foundGroup) {
        setActiveCustomGroup(foundGroup);
      }
    }
  }, [searchParams, friendsList.length, friendGroups.length]);

  // Lifecycle when tabs / submodes change
  useEffect(() => {
    if (activeTab === 'chat') {
      loadMessages();
    } else if (activeTab === 'itineraries') {
      loadTrips();
    } else if (activeTab === 'friends_chat') {
      loadFriends();
      loadFriendGroups();
      if (chatSubMode === 'direct' && activeFriend) {
        loadDirectMessages();
      } else if (chatSubMode === 'groups' && activeCustomGroup) {
        loadGroupMessages();
      }
    } else if (activeTab === 'find_friends') {
      loadFriends(true);
      loadFriendRequests();
    }
  }, [activeGroup, activeTab, chatSubMode, activeFriend?._id, activeCustomGroup?._id]);

  // Polling for real-time messages
  useEffect(() => {
    if (activeTab === 'chat') {
      const interval = setInterval(() => loadMessages(true), 3000);
      return () => clearInterval(interval);
    } else if (activeTab === 'friends_chat') {
      if (chatSubMode === 'direct' && activeFriend) {
        const interval = setInterval(() => loadDirectMessages(true), 3000);
        return () => clearInterval(interval);
      } else if (chatSubMode === 'groups' && activeCustomGroup) {
        const interval = setInterval(() => loadGroupMessages(true), 3000);
        return () => clearInterval(interval);
      }
    } else if (activeTab === 'find_friends') {
      const interval = setInterval(() => loadFriendRequests(true), 5000);
      return () => clearInterval(interval);
    }
  }, [activeGroup, activeTab, chatSubMode, activeFriend?._id, activeCustomGroup?._id]);

  // User Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchCommunityUsers(searchQuery);
        setSearchResults(res.data || []);
      } catch {
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- Friend Actions ---
  const handleSendRequest = async (recipientId) => {
    if (!user) {
      showToast('Please login to send friend requests', 'warning');
      navigate('/login');
      return;
    }
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

  // --- Create Custom Friend Group ---
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

  // --- Send Message in Active 1-on-1 or Group Chat ---
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

  // --- Share Trip in Active Chat (1-on-1 or Group) ---
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

  // --- ACCEPT / JOIN SHARED TRIP (Dynamic Solo -> Duo -> Triple Squad) ---
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
      // Refresh current chat to reflect new collaborators
      if (chatSubMode === 'direct') loadDirectMessages(true);
      if (chatSubMode === 'groups') loadGroupMessages(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to join trip', 'error');
    } finally {
      setJoiningTripId(null);
    }
  };

  // Channel Lounge Handlers
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
        } catch {
          showToast('Failed to delete message', 'error');
        }
      }
    });
  };

  const totalUnreadCount = friendsList.reduce((acc, f) => acc + (f.unreadCount || 0), 0);
  const pendingRequestsCount = incomingRequests.length;
  const pinnedMessage = messages.find((m) => m.pinned);
  const ActiveIcon = activeGroup.icon;

  // Active stream messages
  const activeChatMessages = chatSubMode === 'direct' ? directMessages : groupMessages;
  const activeChatLoading = chatSubMode === 'direct' ? loadingDMs : loadingGroupDMs;

  return (
    <div className="w-full min-h-screen bg-background text-foreground py-6 px-3 sm:px-6 font-sans select-none">
      <div className="max-w-[1440px] mx-auto space-y-4">
        {/* Header bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-2xl bg-[#121215] border border-border/80 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight font-heading">
                WanderSync Community & Friend Groups
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] font-bold border border-orange-500/30 flex items-center gap-1">
                <Sparkles className="size-2.5" />
                <span>Live Hub</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create WhatsApp-style friend groups, chat 1-on-1, share AI itineraries, and co-travel with friends.
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
              <span>Public Lounges</span>
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
              <span>Friends & Groups</span>
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
              <span>Find Friends</span>
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
              <span>Public Trips</span>
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
                  Community Lounges
                </span>
                <p className="text-[11px] text-muted-foreground">Select a channel to join the talk</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/40">
                {COMMUNITY_GROUPS.map((grp) => {
                  const Icon = grp.icon;
                  const isSelected = activeGroup.id === grp.id;
                  return (
                    <button
                      key={grp.id}
                      onClick={() => handleGroupSelect(grp)}
                      className={`w-full p-3 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500/10 border-l-2 border-orange-500'
                          : 'hover:bg-secondary/40'
                      }`}
                    >
                      <div
                        className={`size-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${grp.badgeColor}`}
                      >
                        <Icon className="size-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-orange-400' : 'text-foreground'
                            }`}
                          >
                            {grp.name}
                          </h4>
                          {isSelected && (
                            <span className="size-2 rounded-full bg-orange-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {grp.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={`flex-1 flex flex-col bg-[#121215] min-w-0 ${
                !mobileShowChat ? 'hidden md:flex' : 'flex'
              }`}
            >
              <div className="px-4 py-3 border-b border-border/80 bg-[#151518] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <ArrowLeft className="size-4" />
                  </button>

                  <div
                    className={`size-9 rounded-xl border flex items-center justify-center shrink-0 ${activeGroup.badgeColor}`}
                  >
                    <ActiveIcon className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-foreground truncate">{activeGroup.name}</h3>
                    <p className="text-[10px] text-muted-foreground truncate">{activeGroup.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>

              {pinnedMessage && (
                <div className="p-2.5 px-4 bg-orange-500/10 border-b border-orange-500/20 flex items-center gap-2 text-xs shrink-0">
                  <Pin className="size-3.5 text-orange-400 shrink-0" />
                  <span className="text-orange-300 font-semibold truncate">
                    <strong>Announcement:</strong> {pinnedMessage.text}
                  </span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950/40 to-black/60">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader text="Joining room stream..." />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 p-6">
                    <MessageSquare className="size-10 text-muted-foreground/30" />
                    <h4 className="text-sm font-bold text-foreground">No Messages in this Lounge</h4>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Be the first traveler to post a question, story, or travel snap in {activeGroup.name}!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.user?.role === 'admin';
                    const senderUser = msg.user;
                    const senderId = senderUser?._id?.toString() || senderUser?.toString();
                    const currentUserId = user?._id?.toString();
                    const isMine = Boolean(currentUserId && senderId && currentUserId === senderId);
                    const isLiked = msg.likes?.includes(user?._id);
                    const imagesList = msg.images?.length ? msg.images : msg.image ? [msg.image] : [];

                    const isFriendWithSender = Boolean(
                      friendsList.some((f) => {
                        const fId = (f.friend?._id || f.friend || f._id)?.toString();
                        return fId === senderId;
                      })
                    );
                    const isPendingWithSender = Boolean(
                      outgoingRequests.some((r) => {
                        const rId = (r.recipient?._id || r.recipient)?.toString();
                        return rId === senderId;
                      })
                    );

                    return (
                      <div
                        key={msg._id}
                        className={`flex items-start gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div
                          onClick={() => handleViewUserProfile(senderUser)}
                          className="size-8 rounded-xl border border-border hover:border-orange-500 overflow-hidden bg-secondary shrink-0 cursor-pointer transition-all hover:scale-105 shadow-xs"
                          title="Click to view profile & add friend"
                        >
                          <img
                            src={senderUser?.avatar?.url || senderUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={senderUser?.name || 'User'}
                            className="size-full object-cover"
                          />
                        </div>

                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 space-y-2 shadow-sm border ${
                            isMine
                              ? 'bg-[#1c1c22] border-orange-500/30 text-foreground rounded-tr-xs'
                              : 'bg-[#18181c] border-border/80 text-foreground rounded-tl-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1 text-[11px]">
                            <div className="flex items-center gap-1.5 truncate">
                              <button
                                onClick={() => handleViewUserProfile(senderUser)}
                                className="font-bold text-foreground hover:text-orange-400 truncate cursor-pointer transition-colors flex items-center gap-1"
                                title="View Profile"
                              >
                                <span>{isMine ? 'You' : senderUser?.name || 'Traveler'}</span>
                              </button>

                              {isAdmin && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                                  <Crown className="size-2.5 text-amber-400" />
                                  <span>Admin</span>
                                </span>
                              )}

                              {!isMine && user && (
                                isFriendWithSender ? (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                                    Friend
                                  </span>
                                ) : isPendingWithSender ? (
                                  <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 text-[9px] font-medium border border-zinc-700">
                                    Request Sent
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendRequest(senderUser?._id);
                                    }}
                                    disabled={actionLoadingId === senderUser?._id}
                                    className="px-1.5 py-0.2 rounded bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-white text-[9px] font-bold border border-orange-500/40 transition-colors cursor-pointer flex items-center gap-0.5"
                                    title="Send Friend Request"
                                  >
                                    <UserPlus className="size-2.5" />
                                    <span>+ Add</span>
                                  </button>
                                )
                              )}
                            </div>

                            {(isMine || user?.role === 'admin') && (
                              <button
                                onClick={() => handleDeleteMyMessage(msg)}
                                className="p-1 rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 cursor-pointer"
                                title="Delete Message"
                              >
                                <X className="size-3" />
                              </button>
                            )}
                          </div>

                          {imagesList.length > 0 && (
                            <div
                              className={`grid gap-1.5 rounded-xl overflow-hidden ${
                                imagesList.length === 1
                                  ? 'grid-cols-1'
                                  : imagesList.length === 2
                                  ? 'grid-cols-2'
                                  : 'grid-cols-3'
                              }`}
                            >
                              {imagesList.map((imgUrl, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setPreviewModalImg(imgUrl)}
                                  className="relative aspect-4/3 rounded-lg overflow-hidden border border-border/60 bg-black/40 group cursor-pointer"
                                >
                                  <img
                                    src={imgUrl}
                                    alt="attachment"
                                    className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye className="size-4 text-white" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap select-text">
                            {renderFormattedText(msg.text)}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>

                            <button
                              onClick={() => handleLike(msg._id)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                                isLiked
                                  ? 'bg-rose-500/15 text-rose-400'
                                  : 'hover:bg-secondary/60 text-muted-foreground hover:text-rose-400'
                              }`}
                            >
                              <Heart
                                className={`size-3 ${
                                  isLiked ? 'text-rose-500 fill-rose-500' : ''
                                }`}
                              />
                              <span>{msg.likes?.length || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {imagePreviews.length > 0 && (
                <div className="p-2.5 bg-[#151518] border-t border-border/80 flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                    Attached ({imagePreviews.length}/3):
                  </span>
                  {imagePreviews.map((url, i) => (
                    <div key={i} className="relative size-12 rounded-lg border border-border overflow-hidden shrink-0">
                      <img src={url} alt="preview" className="size-full object-cover" />
                      <button
                        onClick={() => removeSelectedImage(i)}
                        className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-rose-600 cursor-pointer"
                      >
                        <X className="size-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                {/* Floating WhatsApp-style @mention Suggestions Dropdown */}
                {mentionQuery !== null && mentionTarget === 'lounge' && (
                  <div className="absolute bottom-full mb-2 left-3 right-3 sm:left-6 sm:right-auto sm:w-80 bg-[#16161a] border border-orange-500/40 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 backdrop-blur-xl">
                    <div className="px-2 py-1 text-[10px] font-bold text-orange-400 uppercase tracking-wider border-b border-border/40 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>Mention Traveler</span>
                        <span className="text-foreground">(@{mentionQuery})</span>
                      </span>
                      <span className="text-[9px] text-muted-foreground">Click to select</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar divide-y divide-border/20 mt-1">
                      {getMentionSuggestions(mentionQuery).length === 0 ? (
                        <p className="p-3 text-[11px] text-muted-foreground text-center">No matching travelers found</p>
                      ) : (
                        getMentionSuggestions(mentionQuery).map((sugUser) => (
                          <button
                            key={sugUser._id}
                            type="button"
                            onClick={() => handleSelectMention(sugUser)}
                            className="w-full p-2 rounded-xl flex items-center gap-2.5 hover:bg-orange-500/15 text-left cursor-pointer transition-colors group"
                          >
                            <img
                              src={sugUser.avatar?.url || sugUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                              alt={sugUser.name}
                              className="size-7 rounded-xl object-cover border border-border"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground group-hover:text-orange-400 truncate">
                                {sugUser.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">{sugUser.email}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleSendMessage}
                  className="p-2.5 bg-[#151518] border-t border-border/80 flex items-center gap-2 shrink-0"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={selectedImages.length >= 3}
                    className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/80 disabled:opacity-30 cursor-pointer transition-colors"
                    title="Attach Images (Max 3)"
                  >
                    <ImageIcon className="size-4" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={handleLoungeInputChange}
                    placeholder={
                      user
                        ? `Message ${activeGroup.name} (type @ to mention a traveler)...`
                        : 'Please login to send message...'
                    }
                    disabled={!user}
                    className="flex-1 px-3.5 h-[38px] rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 disabled:opacity-50"
                  />

                <GlowingButton
                  type="submit"
                  disabled={
                    sending ||
                    !user ||
                    (!inputText.trim() && selectedImages.length === 0)
                  }
                  size="sm"
                  innerClassName="h-[38px] px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="size-3.5" />
                  <span>Send</span>
                </GlowingButton>
              </form>
            </div>
          </div>
        </div>
      )}

        {/* --- TAB 2: FRIENDS CHAT & WHATSAPP-STYLE GROUPS --- */}
        {activeTab === 'friends_chat' && (
          <div className="rounded-2xl bg-[#121215] border border-border/80 overflow-hidden shadow-lg h-[calc(100vh-210px)] min-h-[560px] flex flex-col md:flex-row">
            {/* Sidebar with Toggle: Direct 1-on-1 vs Custom Groups */}
            <div
              className={`w-full md:w-80 lg:w-96 border-r border-border/80 flex flex-col bg-[#0f0f12] shrink-0 ${
                mobileShowChat ? 'hidden md:flex' : 'flex'
              }`}
            >
              {/* Header + Create Group Button */}
              <div className="p-3 border-b border-border/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#18181b] border border-border/80">
                    <button
                      onClick={() => setChatSubMode('direct')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        chatSubMode === 'direct'
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      1-on-1 ({friendsList.length})
                    </button>
                    <button
                      onClick={() => setChatSubMode('groups')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        chatSubMode === 'groups'
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Groups ({friendGroups.length})
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (friendsList.length === 0) {
                        showToast('Please add friends before creating a group', 'warning');
                        setActiveTab('find_friends');
                        return;
                      }
                      setCreateGroupModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[11px] font-bold hover:bg-orange-500/25 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Create WhatsApp-style Friend Group"
                  >
                    <Plus className="size-3" />
                    <span>New Group</span>
                  </button>
                </div>
              </div>

              {/* List of 1-on-1 Friends or Custom Groups */}
              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/40">
                {chatSubMode === 'direct' ? (
                  loadingFriends ? (
                    <div className="p-8 text-center">
                      <Loader text="Loading friends..." />
                    </div>
                  ) : friendsList.length === 0 ? (
                    <div className="p-8 text-center space-y-3">
                      <Users className="size-8 text-muted-foreground/30 mx-auto" />
                      <p className="text-xs text-muted-foreground">No friends added yet.</p>
                      <button
                        onClick={() => setActiveTab('find_friends')}
                        className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
                      >
                        Search Travelers by Name
                      </button>
                    </div>
                  ) : (
                    friendsList.map((item) => {
                      const friend = item.friend;
                      const isSelected = activeFriend?._id === friend._id;
                      return (
                        <button
                          key={item.friendshipId}
                          onClick={() => {
                            setActiveFriend(friend);
                            setMobileShowChat(true);
                          }}
                          className={`w-full p-3 text-left flex items-center gap-3 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-orange-500/10 border-l-2 border-orange-500'
                              : 'hover:bg-secondary/40'
                          }`}
                        >
                          <div className="relative size-10 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                            <img
                              src={friend.avatar?.url || friend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                              alt={friend.name}
                              className="size-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4
                                className={`text-xs font-bold truncate ${
                                  isSelected ? 'text-orange-400' : 'text-foreground'
                                }`}
                              >
                                {friend.name}
                              </h4>
                              {item.unreadCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[9px] font-bold">
                                  {item.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {item.lastMessage?.text || (item.lastMessage?.sharedTrip ? '✈️ Shared a trip' : 'Connected')}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )
                ) : (
                  // Custom Groups List
                  loadingGroups ? (
                    <div className="p-8 text-center">
                      <Loader text="Loading your friend groups..." />
                    </div>
                  ) : friendGroups.length === 0 ? (
                    <div className="p-8 text-center space-y-3">
                      <Users className="size-8 text-muted-foreground/30 mx-auto" />
                      <p className="text-xs text-muted-foreground">No friend groups created yet.</p>
                      <button
                        onClick={() => setCreateGroupModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer flex items-center gap-1.5 mx-auto"
                      >
                        <Plus className="size-3.5" />
                        <span>Create First Group</span>
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
                          className={`w-full p-3 text-left flex items-center gap-3 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-orange-500/10 border-l-2 border-orange-500'
                              : 'hover:bg-secondary/40'
                          }`}
                        >
                          <div className="size-10 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 shadow-xs">
                            <Users className="size-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4
                                className={`text-xs font-bold truncate ${
                                  isSelected ? 'text-orange-400' : 'text-foreground'
                                }`}
                              >
                                {grp.name}
                              </h4>
                              <span className="text-[10px] text-muted-foreground">
                                {grp.members?.length || 1} members
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {grp.lastMessage?.text || grp.description || 'WhatsApp-style group'}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )
                )}
              </div>
            </div>

            {/* Conversation Window (Direct or Group) */}
            <div
              className={`flex-1 flex flex-col bg-[#121215] min-w-0 ${
                !mobileShowChat ? 'hidden md:flex' : 'flex'
              }`}
            >
              {(chatSubMode === 'direct' && activeFriend) || (chatSubMode === 'groups' && activeCustomGroup) ? (
                <>
                  {/* Conversation Header */}
                  <div className="px-4 py-3 border-b border-border/80 bg-[#151518] flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => setMobileShowChat(false)}
                        className="md:hidden p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <ArrowLeft className="size-4" />
                      </button>

                      {chatSubMode === 'direct' ? (
                        <div className="size-9 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                          <img
                            src={activeFriend.avatar?.url || activeFriend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={activeFriend.name}
                            className="size-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="size-9 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                          <Users className="size-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-foreground truncate">
                          {chatSubMode === 'direct' ? activeFriend.name : activeCustomGroup.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {chatSubMode === 'direct'
                            ? activeFriend.email
                            : `${activeCustomGroup.members?.length || 1} Members in Group`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          loadUserTrips();
                          setTripModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold hover:bg-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Sparkles className="size-3.5" />
                        <span>Share Itinerary</span>
                      </button>
                    </div>
                  </div>

                  {/* Messages Timeline */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950/40 to-black/60">
                    {activeChatLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader text="Loading conversation messages..." />
                      </div>
                    ) : activeChatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-6">
                        <MessageSquare className="size-10 text-muted-foreground/30" />
                        <h4 className="text-sm font-bold text-foreground">
                          {chatSubMode === 'direct'
                            ? `Say Hello to ${activeFriend.name}!`
                            : `Welcome to ${activeCustomGroup.name}!`}
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Start chatting, planning adventures, or share an AI generated trip itinerary with your friends!
                        </p>
                        <button
                          onClick={() => {
                            loadUserTrips();
                            setTripModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Plane className="size-3.5" />
                          <span>Share a Generated Trip</span>
                        </button>
                      </div>
                    ) : (
                      activeChatMessages.map((msg) => {
                        const senderId = msg.sender?._id || msg.sender;
                        const isMine = user?._id === senderId;
                        const senderName = isMine ? 'You' : msg.sender?.name || 'Friend';
                        const senderAvatar = isMine
                          ? user.avatar?.url || user.avatar
                          : msg.sender?.avatar?.url || msg.sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

                        const trip = msg.sharedTrip;
                        const imagesList = msg.images || [];

                        // Check if current user is already a member of this shared trip
                        const isTripMember =
                          trip &&
                          (trip.user === user?._id ||
                            trip.collaborators?.some(
                              (c) =>
                                (c.user && (c.user._id === user?._id || c.user === user?._id)) ||
                                (c.email && c.email.toLowerCase() === user?.email?.toLowerCase())
                            ));

                        const partyTypeLabel = trip?.travelerPartyType || (trip?.collaborators?.length ? `Group (${trip.collaborators.length + 1} Travelers)` : 'Solo Explorer');

                        return (
                          <div
                            key={msg._id}
                            className={`flex items-start gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            <div className="size-8 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                              <img src={senderAvatar} alt={senderName} className="size-full object-cover" />
                            </div>

                            <div
                              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 space-y-2 shadow-sm border ${
                                isMine
                                  ? 'bg-[#1c1c22] border-orange-500/30 text-foreground rounded-tr-xs'
                                  : 'bg-[#18181c] border-border/80 text-foreground rounded-tl-xs'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1 text-[11px]">
                                <span className="font-bold text-foreground truncate">{senderName}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>

                              {/* --- RICH SHARED TRIP CARD WITH DYNAMIC ACCEPT & JOIN --- */}
                              {trip && (
                                <div className="p-3.5 rounded-xl bg-[#121215] border border-orange-500/50 space-y-2.5 shadow-md">
                                  <div className="flex items-center justify-between gap-1">
                                    {/* Dynamic Party Badge (Solo -> Duo -> Triple -> Tribe) */}
                                    <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30 flex items-center gap-1">
                                      <Flame className="size-2.5 text-orange-400 animate-pulse" />
                                      <span>{partyTypeLabel}</span>
                                    </span>

                                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                                      <DollarSign className="size-3" />
                                      {trip.estimatedTotalCost || 0} {trip.currency || 'USD'}
                                    </span>
                                  </div>

                                  <div>
                                    <h4 className="text-xs font-extrabold text-foreground line-clamp-1">{trip.title}</h4>
                                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                      <MapPin className="size-3 text-orange-400 shrink-0" />
                                      <span>{trip.destination?.city || trip.destination?.country || 'Destination'}</span>
                                      <span>•</span>
                                      <span>{trip.days?.length || 3} Days</span>
                                    </p>
                                  </div>

                                  {trip.overview && (
                                    <p className="text-[10px] text-muted-foreground line-clamp-2 italic">
                                      "{trip.overview}"
                                    </p>
                                  )}

                                  {/* Action Buttons: Join Trip & Explore */}
                                  <div className="flex items-center gap-2 pt-1">
                                    {!isTripMember ? (
                                      <button
                                        onClick={() => handleAcceptJoinTrip(trip._id, trip.title)}
                                        disabled={joiningTripId === trip._id}
                                        className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                                      >
                                        <UserCheck className="size-3" />
                                        <span>Accept & Join Trip</span>
                                      </button>
                                    ) : (
                                      <div className="flex-1 py-1 px-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center justify-center gap-1">
                                        <CheckCircle2 className="size-3" />
                                        <span>You are in this Trip!</span>
                                      </div>
                                    )}

                                    <button
                                      onClick={() => navigate(`/itinerary/${trip._id}`)}
                                      className="py-1.5 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                                    >
                                      <span>View</span>
                                      <ArrowRight className="size-3" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Images */}
                              {imagesList.length > 0 && (
                                <div className="grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden">
                                  {imagesList.map((imgUrl, idx) => (
                                    <div
                                      key={idx}
                                      onClick={() => setPreviewModalImg(imgUrl)}
                                      className="relative aspect-4/3 rounded-lg overflow-hidden border border-border bg-black/40 cursor-pointer"
                                    >
                                      <img src={imgUrl} alt="attachment" className="size-full object-cover" />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Text */}
                              {msg.text && (
                                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap select-text">
                                  {renderFormattedText(msg.text)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatMessagesEndRef} />
                  </div>

                  {/* Attached Images Preview */}
                  {chatImagePreviews.length > 0 && (
                    <div className="p-2.5 bg-[#151518] border-t border-border/80 flex items-center gap-2 overflow-x-auto">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                        Attached ({chatImagePreviews.length}/3):
                      </span>
                      {chatImagePreviews.map((url, i) => (
                        <div key={i} className="relative size-12 rounded-lg border border-border overflow-hidden shrink-0">
                          <img src={url} alt="preview" className="size-full object-cover" />
                          <button
                            onClick={() => removeChatSelectedImage(i)}
                            className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-rose-600 cursor-pointer"
                          >
                            <X className="size-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    {/* Floating WhatsApp-style @mention Suggestions Dropdown for Chat */}
                    {mentionQuery !== null && mentionTarget === 'chat' && (
                      <div className="absolute bottom-full mb-2 left-3 right-3 sm:left-6 sm:right-auto sm:w-80 bg-[#16161a] border border-orange-500/40 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 backdrop-blur-xl">
                        <div className="px-2 py-1 text-[10px] font-bold text-orange-400 uppercase tracking-wider border-b border-border/40 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span>Mention Traveler</span>
                            <span className="text-foreground">(@{mentionQuery})</span>
                          </span>
                          <span className="text-[9px] text-muted-foreground">Click to select</span>
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar divide-y divide-border/20 mt-1">
                          {getMentionSuggestions(mentionQuery).length === 0 ? (
                            <p className="p-3 text-[11px] text-muted-foreground text-center">No matching travelers found</p>
                          ) : (
                            getMentionSuggestions(mentionQuery).map((sugUser) => (
                              <button
                                key={sugUser._id}
                                type="button"
                                onClick={() => handleSelectMention(sugUser)}
                                className="w-full p-2 rounded-xl flex items-center gap-2.5 hover:bg-orange-500/15 text-left cursor-pointer transition-colors group"
                              >
                                <img
                                  src={sugUser.avatar?.url || sugUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                  alt={sugUser.name}
                                  className="size-7 rounded-xl object-cover border border-border"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-foreground group-hover:text-orange-400 truncate">
                                    {sugUser.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">{sugUser.email}</p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Message Input Form */}
                    <form
                      onSubmit={handleSendChatStreamMessage}
                      className="p-2.5 bg-[#151518] border-t border-border/80 flex items-center gap-2 shrink-0"
                    >
                      <input
                        type="file"
                        ref={chatFileInputRef}
                        accept="image/*"
                        multiple
                        onChange={handleChatImageSelect}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => chatFileInputRef.current?.click()}
                        disabled={chatSelectedImages.length >= 3}
                        className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/80 disabled:opacity-30 cursor-pointer transition-colors"
                        title="Attach Images (Max 3)"
                      >
                        <ImageIcon className="size-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          loadUserTrips();
                          setTripModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 cursor-pointer transition-colors"
                        title="Attach Your Generated Itinerary"
                      >
                        <Plane className="size-4" />
                      </button>

                      <input
                        type="text"
                        value={chatInputText}
                        onChange={handleChatInputChange}
                        placeholder={
                          chatSubMode === 'direct'
                            ? `Message ${activeFriend?.name}...`
                            : `Message ${activeCustomGroup?.name} (type @ to mention)...`
                        }
                        className="flex-1 px-3.5 h-[38px] rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60"
                      />

                      <GlowingButton
                        type="submit"
                        disabled={
                          chatSending ||
                          (!chatInputText.trim() && chatSelectedImages.length === 0)
                        }
                        size="sm"
                        innerClassName="h-[38px] px-4 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Send className="size-3.5" />
                        <span>Send</span>
                      </GlowingButton>
                    </form>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <Users className="size-12 text-muted-foreground/30" />
                  <h3 className="text-sm font-bold text-foreground">Select a Friend or Group to Start Chatting</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Pick a friend or custom friend group from the left sidebar to talk and co-plan your trips together!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 3: FIND FRIENDS & MANAGE REQUESTS --- */}
        {activeTab === 'find_friends' && (
          <div className="rounded-2xl bg-[#121215] border border-border/80 p-4 sm:p-6 space-y-6 shadow-lg min-h-[560px]">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFriendsFilter('search')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    friendsFilter === 'search'
                      ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-xs'
                      : 'border-border/60 bg-[#18181b] text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Search className="size-3.5" />
                  <span>Search Travelers by Name</span>
                </button>

                <button
                  onClick={() => setFriendsFilter('requests')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border relative ${
                    friendsFilter === 'requests'
                      ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-xs'
                      : 'border-border/60 bg-[#18181b] text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserCheck className="size-3.5" />
                  <span>Requests</span>
                  {incomingRequests.length > 0 && (
                    <span className="size-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {incomingRequests.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setFriendsFilter('my_friends')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    friendsFilter === 'my_friends'
                      ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-xs'
                      : 'border-border/60 bg-[#18181b] text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="size-3.5" />
                  <span>My Friends ({friendsList.length})</span>
                </button>
              </div>
            </div>

            {/* SEARCH VIEW */}
            {friendsFilter === 'search' && (
              <div className="space-y-5">
                <div className="relative max-w-xl">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type profile name or email to find travelers..."
                    className="w-full pl-10 pr-4 h-11 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 transition-colors shadow-xs"
                  />
                </div>

                {searching ? (
                  <div className="py-12 text-center">
                    <Loader text="Searching travelers across WanderSync..." />
                  </div>
                ) : searchQuery.trim() && searchResults.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Users className="size-8 text-muted-foreground/30 mx-auto" />
                    <h4 className="text-sm font-bold text-foreground">No Travelers Found</h4>
                    <p className="text-xs text-muted-foreground">Try searching with a different profile name or email.</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {searchResults.map((u) => {
                      const isSelf = user?._id === u._id;
                      if (isSelf) return null;

                      const isPendingSent = u.friendshipStatus === 'pending_sent';
                      const isPendingReceived = u.friendshipStatus === 'pending_received';
                      const isFriends = u.friendshipStatus === 'friends';

                      return (
                        <div
                          key={u._id}
                          className="p-4 rounded-2xl bg-[#16161a] border border-border/80 flex items-center justify-between gap-3 shadow-xs hover:border-orange-500/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-10 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                              <img
                                src={u.avatar?.url || u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                alt={u.name}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-foreground truncate">{u.name}</h4>
                              <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isFriends ? (
                              <button
                                onClick={() => handleStartChatWithFriend(u)}
                                className="px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[11px] font-bold hover:bg-orange-500/25 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <MessageSquare className="size-3" />
                                <span>Chat</span>
                              </button>
                            ) : isPendingSent ? (
                              <span className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[11px] font-semibold border border-zinc-700 flex items-center gap-1">
                                <Clock className="size-3" />
                                <span>Sent</span>
                              </span>
                            ) : isPendingReceived ? (
                              <button
                                onClick={() => handleRespondRequest(u.requestId, 'accept')}
                                disabled={actionLoadingId === u.requestId}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-bold hover:bg-emerald-600 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Check className="size-3" />
                                <span>Accept</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSendRequest(u._id)}
                                disabled={actionLoadingId === u._id}
                                className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                              >
                                <UserPlus className="size-3" />
                                <span>Add</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border/80 p-8">
                    <UserPlus className="size-10 text-muted-foreground/30 mx-auto" />
                    <h4 className="text-sm font-bold text-foreground">Find Travel Buddies</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Search any traveler by their profile name to send a friend request, create multi-friend groups, and share itineraries.
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
                                src={req.requester?.avatar?.url || req.requester?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
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

                <div className="space-y-3 pt-4 border-t border-border/60">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Sent Requests ({outgoingRequests.length})
                  </h3>

                  {outgoingRequests.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No sent requests pending.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {outgoingRequests.map((req) => (
                        <div
                          key={req._id}
                          className="p-4 rounded-2xl bg-[#16161a] border border-border/80 flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-10 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                              <img
                                src={req.recipient?.avatar?.url || req.recipient?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                alt={req.recipient?.name}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-foreground truncate">{req.recipient?.name}</h4>
                              <p className="text-[10px] text-muted-foreground truncate">Pending response</p>
                            </div>
                          </div>

                          <span className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[10px] font-semibold border border-zinc-700">
                            Pending
                          </span>
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
                    <button
                      onClick={() => setFriendsFilter('search')}
                      className="px-3.5 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
                    >
                      Find Friends Now
                    </button>
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
                                src={friend.avatar?.url || friend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                alt={friend.name}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-foreground truncate">{friend.name}</h4>
                              <p className="text-[10px] text-muted-foreground truncate">{friend.email}</p>
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
                              onClick={() => handleRemoveFriend(item.friendshipId, friend.name)}
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

        {/* --- TAB 4: PUBLIC ITINERARIES --- */}
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
                          {trip.destinationCountry || 'Global'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {trip.durationDays || 3} Days
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-foreground line-clamp-1">{trip.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{trip.description}</p>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3 text-orange-400" />
                        <span className="truncate">{trip.destinationCity || 'Destination'}</span>
                      </div>

                      <button
                        onClick={() => navigate(`/itinerary/${trip._id}`)}
                        className="px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="size-3" />
                      </button>
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    Select Friends to Add ({selectedMemberIds.length} selected) *
                  </label>
                </div>

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
                              src={friend.avatar?.url || friend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
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
                  <span>{creatingGroup ? 'Creating Group...' : 'Create WhatsApp-style Group'}</span>
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

            <p className="text-xs text-muted-foreground">
              Select one of your generated trips below. When friends accept, the trip upgrades to a Duo / Triple / Group Expedition in their library:
            </p>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
              {loadingMyTrips ? (
                <div className="py-12 text-center">
                  <Loader text="Loading your trips..." />
                </div>
              ) : myTrips.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <Plane className="size-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground">You haven't generated any trips yet.</p>
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
                        <span className="px-1.5 py-0.2 rounded bg-orange-500/15 text-orange-400 text-[9px] font-bold">
                          {trip.travelerPartyType || 'Solo'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="size-3 text-orange-400" />
                        <span>{trip.destination?.city || trip.destinationCity || 'Destination'}</span>
                        <span>•</span>
                        <span>{trip.days?.length || trip.durationDays || 3} Days</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">${trip.estimatedTotalCost || 0}</span>
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
              {/* Avatar */}
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
                <span className="absolute bottom-1 right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-[#141418]" />
              </div>

              {/* Name & Role */}
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

              {/* Travel Stats & Preferences Grid */}
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
                    Preferred Currency
                  </span>
                  <span className="font-semibold text-emerald-400 mt-0.5 block">
                    {selectedProfileUser.preferences?.currency || 'USD'} ($)
                  </span>
                </div>

                {selectedProfileUser.createdAt && (
                  <div className="col-span-2 pt-1 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Member Since</span>
                    <span className="font-medium text-foreground">
                      {new Date(selectedProfileUser.createdAt).toLocaleDateString([], {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons based on Friendship Status */}
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
                ) : friendsList.some((f) => f.friend?._id === selectedProfileUser._id) ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setProfileModalOpen(false);
                        handleStartChatWithFriend(selectedProfileUser);
                      }}
                      className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <MessageSquare className="size-3.5" />
                      <span>Send Direct Message</span>
                    </button>
                    <div className="text-center">
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="size-3" />
                        <span>Connected Friends</span>
                      </span>
                    </div>
                  </div>
                ) : outgoingRequests.some(
                    (r) => (r.recipient?._id || r.recipient) === selectedProfileUser._id
                  ) ? (
                  <div className="w-full py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                    <Clock className="size-3.5 text-zinc-400" />
                    <span>Friend Request Sent (Pending)</span>
                  </div>
                ) : incomingRequests.some(
                    (r) => (r.requester?._id || r.requester) === selectedProfileUser._id
                  ) ? (
                  <div className="space-y-2">
                    <span className="text-xs text-orange-400 font-bold block text-center">
                      This traveler sent you a friend request!
                    </span>
                    <button
                      onClick={() => {
                        const req = incomingRequests.find(
                          (r) => (r.requester?._id || r.requester) === selectedProfileUser._id
                        );
                        if (req) handleRespondRequest(req._id, 'accept');
                        setProfileModalOpen(false);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <UserCheck className="size-3.5" />
                      <span>Accept Friend Request</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleSendRequest(selectedProfileUser._id);
                      setProfileModalOpen(false);
                    }}
                    disabled={actionLoadingId === selectedProfileUser._id}
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
