
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/IconComponents';

const TicTacToePage: React.FC = () => {
    const navigate = useNavigate();
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [wins, setWins] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('tictactoe_wins');
        if (saved) setWins(parseInt(saved));
    }, []);

    const calculateWinner = (squares: (string | null)[]) => {
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        for (let line of lines) {
            const [a, b, c] = line;
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
        }
        return squares.every(s => s) ? 'Draw' : null;
    };

    const winner = calculateWinner(board);

    useEffect(() => {
        if (winner === 'X') {
            const nextWins = wins + 1;
            setWins(nextWins);
            localStorage.setItem('tictactoe_wins', nextWins.toString());
        }
    }, [winner]);

    const handleClick = (i: number) => {
        if (winner || board[i]) return;
        const nextBoard = board.slice();
        nextBoard[i] = isXNext ? 'X' : 'O';
        setBoard(nextBoard);
        setIsXNext(!isXNext);
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800 min-h-screen text-white rounded-xl">
            <div className="flex w-full justify-between items-center max-w-md mb-10">
                <button onClick={() => navigate('/')} className="p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-full border border-gray-200 dark:border-gray-600"><ArrowLeftIcon /></button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tighter">Tic-Tac-Toe</h1>
                    <p className="text-[10px] text-gray-500 font-mono">YOUR WINS: {wins}</p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="text-2xl mb-6 font-bold text-gray-700 dark:text-gray-300 font-mono">
                {winner ? (winner === 'Draw' ? "IT'S A DRAW!" : `WINNER: ${winner}`) : `NEXT: ${isXNext ? 'X' : 'O'}`}
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white dark:bg-gray-900/50 p-3 rounded-lg shadow-md">
                {board.map((cell, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(i)}
                        className={`w-20 h-20 flex items-center justify-center text-5xl font-black rounded-lg transition-all ${cell ? '' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    >
                        <span className={cell === 'X' ? 'text-blue-500' : 'text-red-500'}>{cell}</span>
                    </button>
                ))}
            </div>

            <button onClick={() => setBoard(Array(9).fill(null))} className="mt-10 px-10 py-3 bg-gray-800 text-white dark:bg-gray-200 dark:text-black rounded-lg font-bold shadow-md active:scale-95 transition-transform">RESET BOARD</button>
            
            <p className="mt-10 text-[10px] text-gray-500 dark:text-gray-400 font-mono uppercase tracking-[0.2em]">Get three in a row to win</p>
        </div>
    );
};

export default TicTacToePage;