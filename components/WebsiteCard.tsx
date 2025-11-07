import React from 'react';
import { Website } from '../types';
import { TrashIcon, EditIcon } from './IconComponents';

interface WebsiteCardProps {
    website: Website;
    onDelete: (id: string) => void;
    onStartEdit: (website: Website) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, websiteId: string) => void;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({ website, onDelete, onStartEdit, onDragStart }) => {
    return (
        <div 
            draggable
            onDragStart={(e) => onDragStart(e, website.id)}
            className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
        >
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                    onClick={() => onStartEdit(website)}
                    className="p-2 rounded-full bg-gray-700/50 text-white hover:bg-gray-700/80 transition-colors"
                    aria-label="Edit website"
                >
                    <EditIcon />
                </button>
                <button 
                    onClick={() => onDelete(website.id)}
                    className="p-2 rounded-full bg-red-600/70 text-white hover:bg-red-600/90 transition-colors"
                    aria-label="Delete website"
                >
                    <TrashIcon />
                </button>
            </div>
            <img 
                src={website.thumbnailUrl || `https://via.placeholder.com/400x225?text=${website.title}`} 
                alt={website.title} 
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{website.title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 h-10 overflow-hidden text-ellipsis">
                    {website.description}
                </p>
            </div>
        </div>
    );
};

export default WebsiteCard;
