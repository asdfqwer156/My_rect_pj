import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/IconComponents';

// 여기에 '넣으려는 앱'의 코드를 작성합니다.
const CalculatorPage: React.FC = () => {
    const navigate = useNavigate();
    const [count, setCount] = useState(0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-2xl mx-auto mt-10">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    나의 미니 앱 (예: 계산기)
                </h2>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeftIcon />
                    <span>돌아가기</span>
                </button>
            </div>

            <div className="p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    이곳에 외부에서 만든 앱 코드를 붙여넣으세요.<br/>
                    (지금은 예시로 카운터를 넣었습니다)
                </p>
                
                <div className="text-6xl font-bold text-primary-600 mb-6">
                    {count}
                </div>
                
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => setCount(c => c - 1)}
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-bold text-xl hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        -
                    </button>
                    <button 
                        onClick={() => setCount(c => c + 1)}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg font-bold text-xl hover:bg-primary-700"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalculatorPage;