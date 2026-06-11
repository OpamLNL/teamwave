export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex justify-center py-6 gap-2">
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 border rounded-full text-sm transition ${
                        page === currentPage
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-100'
                    }`}
                >
                    {page}
                </button>
            ))}
        </div>
    );
}