

const TableSortLabel = ({ children, active, direction, onClick }) => {
    return (
        <div className={`group flex items-center cursor-pointer ${active ? 'text-gray-700 dark:text-gray-300' : ''}`} onClick={onClick}>
            {children}
            <svg className={`w-4 h-4 cursor-pointer opacity-0 group-hover:opacity-50 transition-all
            ${direction === 'asc' ? 'rotate-180' : 'rotate-0' }
            ${active ? '!opacity-100' : ''}`}
                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
        </div>
    )
}

export default TableSortLabel;