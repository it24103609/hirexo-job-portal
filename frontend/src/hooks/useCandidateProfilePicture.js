import { useEffect, useMemo, useState } from 'react';
import { candidateApi } from '../services/candidate.api';

export function useCandidateProfilePicture(profilePicture) {
  const [imageUrl, setImageUrl] = useState('');

  const pictureKey = useMemo(() => {
    if (!profilePicture) return '';
    return [
      profilePicture.fileName || '',
      profilePicture.uploadedAt || '',
      profilePicture.size || ''
    ].join('|');
  }, [profilePicture]);

  useEffect(() => {
    let objectUrl = '';
    let isActive = true;

    if (!profilePicture) {
      setImageUrl('');
      return undefined;
    }

    candidateApi.downloadProfilePicture()
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
  }, [pictureKey, profilePicture]);

  return imageUrl;
}
