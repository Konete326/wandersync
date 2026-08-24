import { useEffect, useRef } from 'react';
import { getAdminActivity } from '@/services/adminService';
import { useModal } from '@/context/ModalContext';

export function useAdminLiveAlerts() {
  const { showToast } = useModal();
  const lastActivityId = useRef(null);

  useEffect(() => {
    const checkLiveFeed = async () => {
      try {
        const res = await getAdminActivity();
        if (res.data && res.data.length > 0) {
          const latest = res.data[0];
          if (lastActivityId.current && lastActivityId.current !== latest.id) {
            showToast(`Live Alert: ${latest.title}`, 'info');
          }
          lastActivityId.current = latest.id;
        }
      } catch {
      }
    };

    checkLiveFeed();
    const interval = setInterval(checkLiveFeed, 15000);
    return () => clearInterval(interval);
  }, [showToast]);
}
