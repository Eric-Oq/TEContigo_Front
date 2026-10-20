import React from 'react';
import { ObjectItemsScreen } from '../ObjectItemsScreen';

export const LostItemsScreen: React.FC<{ onOpenRequests: () => void }> = ({ onOpenRequests }) => (
  <ObjectItemsScreen kind="lost" onOpenRequests={onOpenRequests} />
);
