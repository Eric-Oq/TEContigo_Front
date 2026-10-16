import React from 'react';
import type { ObjectItem } from '../../../api/objects/objectsApi';
import { ObjectItemCard } from '../ObjectItemCard';

interface LostItemCardProps {
  item: ObjectItem;
  onEdit: (item: ObjectItem) => void;
  onDelete: (item: ObjectItem) => void;
}

export const LostItemCard: React.FC<LostItemCardProps> = (props) => (
  <ObjectItemCard {...props} itemType="perdido" />
);
