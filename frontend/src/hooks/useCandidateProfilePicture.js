import { useEffect, useMemo, useState } from 'react';
import { candidateApi } from '../services/candidate.api';

export function useCandidateProfilePicture(profilePicture) {
  const [imageUrl, setImageUrl] = useState('');

  const normalizedProfilePicture = useMemo(() => {
    if (!profilePicture) return null;
    if (profilePicture.fileName || profilePicture.filePath || profilePicture.uploadedAt || profilePicture.size) {
      return profilePicture;
    }
    return profilePicture.data || null;
  }, [profilePicture]);

  const pictureKey = useMemo(() => {
    if (!normalizedProfilePicture) return '';
    return [
      normalizedProfilePicture.fileName || '',
      normalizedProfilePicture.uploadedAt || '',
      normalizedProfilePicture.size || ''
    ].join('|');
  }, [normalizedProfilePicture]);

  useEffect(() => {
    let objectUrl = '';
    let isActive = true;

    if (!normalizedProfilePicture) {
      setImageUrl('');
      return undefined;
    }

    candidateApi.downloadProfilePicture(pictureKey)
      .then((blob) => {
        if (!isActive) return;
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      })
      .catch(() => {
        if (isActive) setImageUrl('');
      });

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pictureKey, normalizedProfilePicture]);

  return imageUrl;
}
