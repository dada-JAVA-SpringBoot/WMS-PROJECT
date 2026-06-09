import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700
                       text-gray-800 dark:text-gray-100 transition-colors"
            title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    )
}