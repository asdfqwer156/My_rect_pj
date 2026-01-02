
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/IconComponents';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const MinesweeperPage: React.FC = () => {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
    const [board, setBoard] = useState<any[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [wins, setWins] = useState(0);

    const config = {
        EASY: { size: 8, mines: 10 },
        MEDIUM: { size: 10, mines: 20 },
        HARD: { size: 12, mines: 35 }
    };

    useEffect(() => {
        const saved = localStorage.getItem(`mines_wins_${difficulty}`);
        setWins(saved ? parseInt(saved) : 0);
    }, [difficulty]);

    const initBoard = useCallback(() => {
        const { size, mines: minesCount } = config[difficulty];
        const newBoard = Array(size * size).fill(null).map((_, i) => ({
            id: i,
            isMine: false,
            revealed: false,
            flagged: false,
            neighborMines: 0
        }));

        let minesPlaced = 0;
        while (minesPlaced < minesCount) {
            const idx = Math.floor(Math.random() * (size * size));
            if (!newBoard[idx].isMine) {
                newBoard[idx].isMine = true;
                minesPlaced++;
            }
        }

        newBoard.forEach((cell, i) => {
            if (cell.isMine) return;
            const r = Math.floor(i / size);
            const c = i % size;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                        if (newBoard[nr * size + nc].isMine) count++;
                    }
                }
            }
            cell.neighborMines = count;
        });

        setBoard(newBoard);
        setGameOver(false);
        setWon(false);
    }, [difficulty]);

    useEffect(() => { initBoard(); }, [initBoard]);

    const reveal = (idx: number) => {
        if (gameOver || won || board[idx].revealed || board[idx].flagged) return;

        if (board[idx].isMine) {
            setBoard(prev => prev.map(c => ({...c, revealed: true }))); // Show all mines on loss
            setGameOver(true);
            return;
        }

        const size = config[difficulty].size;
        const newBoard = JSON.parse(JSON.stringify(board));
        const flood = (i: number) => {
            if (i < 0 || i >= size * size || newBoard[i].revealed || newBoard[i].flagged) return;
            newBoard[i].revealed = true;
            if (newBoard[i].neighborMines === 0) {
                const r = Math.floor(i / size), c = i % size;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if(dr === 0 && dc === 0) continue;
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < size && nc >= 0 && nc < size) flood(nr * size + nc);
                    }
                }
            }
        };
        flood(idx);
        setBoard(newBoard);

        if (newBoard.filter(c => !c.isMine && !c.revealed).length === 0) {
            setWon(true);
            const newWins = wins + 1;
            setWins(newWins);
            localStorage.setItem(`mines_wins_${difficulty}`, newWins.toString());
        }
    };

    const toggleFlag = (e: React.MouseEvent, idx: number) => {
        e.preventDefault();
        if (gameOver || won || board[idx].revealed) return;
        setBoard(prev => prev.map((c, i) => i === idx ? { ...c, flagged: !c.flagged } : c));
    };

    const getNumberColor = (num: number) => {
      switch(num) {
        case 1: return 'text-blue-600';
        case 2: return 'text-green-700';
        case 3: return 'text-red-600';
        case 4: return 'text-blue-900';
        case 5: return 'text-red-800';
        case 6: return 'text-cyan-600';
        case 7: return 'text-black';
        case 8: return 'text-gray-600';
        default: return '';
      }
    }

    return (
        <div className="flex flex-col items-center p-4 bg-gray-200 dark:bg-gray-700 min-h-screen text-black dark:text-white rounded-xl">
            <div className="flex w-full justify-between items-center max-w-md mb-6">
                <button onClick={() => navigate('/')} className="p-2 bg-white dark:bg-gray-600 rounded-full border border-gray-300 dark:border-gray-500"><ArrowLeftIcon /></button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 uppercase">Minesweeper</h1>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 tracking-widest font-mono">TOTAL WINS: {wins}</p>
                </div>
                <div className="font-mono bg-black text-red-500 text-lg p-2 rounded-md">💣 {config[difficulty].mines - board.filter(c => c.flagged).length}</div>
            </div>

            <div className="flex gap-2 mb-6">
                {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
                    <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${difficulty === d ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                    >
                        {d}
                    </button>
                ))}
            </div>

            <div 
                className="grid gap-0.5 bg-gray-400 p-2 border-2 border-t-gray-200 border-l-gray-200 border-b-gray-500 border-r-gray-500"
                style={{ gridTemplateColumns: `repeat(${config[difficulty].size}, minmax(0, 1fr))` }}
            >
                {board.map((cell, i) => (
                    <div
                        key={i}
                        onClick={() => reveal(i)}
                        onContextMenu={(e) => toggleFlag(e, i)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-base font-black rounded-sm cursor-pointer transition-all ${
                            cell.revealed 
                                ? `border border-gray-400 ${cell.isMine ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-500'}`
                                : 'bg-gray-300 dark:bg-gray-600 border-2 border-t-white/80 dark:border-t-gray-400 border-l-white/80 dark:border-l-gray-400 border-b-gray-500/80 dark:border-b-gray-800 border-r-gray-500/80 dark:border-r-gray-800 active:border-0'
                        }`}
                    >
                        {cell.revealed 
                            ? (cell.isMine ? '💣' : (cell.neighborMines > 0 ? <span className={getNumberColor(cell.neighborMines)}>{cell.neighborMines}</span> : '')) 
                            : (cell.flagged ? '🚩' : '')}
                    </div>
                ))}
            </div>

            {(gameOver || won) && (
                <div className="mt-8 text-center">
                    <div className={`text-2xl font-black mb-4 ${won ? 'text-green-600' : 'text-red-600'}`}>
                        {won ? 'VICTORY!' : 'GAME OVER!'}
                    </div>
                    <button onClick={initBoard} className="px-8 py-3 bg-blue-600 text-white rounded-md font-bold shadow-md">RETRY</button>
                </div>
            )}
        </div>
    );
};

export default MinesweeperPage;