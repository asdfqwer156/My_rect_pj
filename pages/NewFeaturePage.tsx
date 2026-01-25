import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/IconComponents';

const NewFeaturePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto mt-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                새로운 기능 페이지
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                이곳은 새로운 기능을 위해 추가된 페이지입니다.<br/>
                react-router-dom을 통해 헤더와 푸터는 유지된 채<br/>
                내부 콘텐츠만 변경되었습니다.
            </p>
            <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
                <ArrowLeftIcon />
                <span>대시보드로 돌아가기</span>
            </button>
        </div>
    );
};

export default NewFeaturePage;