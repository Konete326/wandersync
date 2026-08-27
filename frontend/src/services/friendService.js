import api from './api';

export const searchCommunityUsers = async (query) => {
  const response = await api.get(`/friends/search?query=${encodeURIComponent(query)}`);
  return response.data;
};

export const sendFriendRequest = async (recipientId) => {
  const response = await api.post('/friends/request', { recipientId });
  return response.data;
};

export const respondFriendRequest = async (requestId, action) => {
  const response = await api.put(`/friends/request/${requestId}/respond`, { action });
  return response.data;
};

export const fetchFriendsList = async () => {
  const response = await api.get('/friends');
  return response.data;
};

export const fetchFriendRequests = async () => {
  const response = await api.get('/friends/requests');
  return response.data;
};

export const removeFriendConnection = async (friendshipId) => {
  const response = await api.delete(`/friends/${friendshipId}`);
  return response.data;
};

export const fetchDirectMessages = async (friendId) => {
  const response = await api.get(`/friends/messages/${friendId}`);
  return response.data;
};

export const sendDirectMessage = async (friendId, payload) => {
  const isFormData = payload instanceof FormData;
  const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await api.post(`/friends/messages/${friendId}`, payload, { headers });
  return response.data;
};

// Custom Friend Groups & WhatsApp-style Chat
export const createFriendGroup = async (groupData) => {
  const response = await api.post('/friends/groups', groupData);
  return response.data;
};

export const fetchFriendGroups = async () => {
  const response = await api.get('/friends/groups');
  return response.data;
};

export const fetchGroupMessages = async (groupId) => {
  const response = await api.get(`/friends/groups/${groupId}/messages`);
  return response.data;
};

export const sendGroupMessage = async (groupId, payload) => {
  const isFormData = payload instanceof FormData;
  const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await api.post(`/friends/groups/${groupId}/messages`, payload, { headers });
  return response.data;
};

// Join Trip Invitation (Solo -> Duo -> Triple Squad)
export const joinTripInvitation = async (tripId) => {
  const response = await api.post(`/friends/trips/${tripId}/join`);
  return response.data;
};

// User Notifications (Unread Messages & Incoming Requests)
export const fetchUserNotifications = async () => {
  const response = await api.get('/friends/notifications');
  return response.data;
};

export const markNotificationReadAsSeen = async (notifId) => {
  const response = await api.put(`/friends/notifications/${notifId}/read`);
  return response.data;
};
