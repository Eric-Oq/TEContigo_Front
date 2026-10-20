import React from 'react';
import { ObjectItemsScreen } from '../ObjectItemsScreen';

export const FoundItemsScreen: React.FC<{ onOpenRequests: () => void }> = ({ onOpenRequests }) => (
  <ObjectItemsScreen kind="found" onOpenRequests={onOpenRequests} />
);
