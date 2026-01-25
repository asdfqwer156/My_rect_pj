import React from 'react';
import { NewsPost } from '../types';

const NewsItem: React.FC<{ post: NewsPost }> = ({ post }) => (
    <div className="my-2 p-1 bg-gray-800 rounded">
        <img src={post.capturedImage} alt={post.headline} className="w-full h-auto object-cover rounded-sm mb-1" />
        <p className="text-white text-xs font-bold text-center">{post.headline}</p>
    </div>
);

export default NewsItem;
