import React from 'react';
import type { ObjectItem } from '../../../api/objects/objectsApi';
import { ObjectItemCard } from '../ObjectItemCard';

interface FoundItemCardProps {
  item: ObjectItem;
  onEdit: (item: ObjectItem) => void;
  onDelete: (item: ObjectItem) => void;
}

export const FoundItemCard: React.FC<FoundItemCardProps> = (props) => (
  <ObjectItemCard {...props} itemType="encontrado" />
);
