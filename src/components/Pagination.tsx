interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	className?: string;
}

export default function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	className = "",
}: Readonly<PaginationProps>) {
	if (totalPages <= 1) return null;

	// Generate page numbers with ellipsis for large page counts
	const getPageNumbers = () => {
		const delta = 2; // Show 2 pages around current page
		const left = currentPage - delta;
		const right = currentPage + delta + 1;
		const range: (number | string)[] = [];
		const rangeWithDots: (number | string)[] = [];
		let l: number;

		for (let i = 1; i <= totalPages; i++) {
			if (i == 1 || i == totalPages || (i >= left && i < right)) {
				range.push(i);
			}
		}

		range.forEach((i) => {
			if (l) {
				if (i !== l + 1) {
					rangeWithDots.push('...');
				}
			}
			rangeWithDots.push(i);
			l = i as number;
		});

		return rangeWithDots;
	};

	const handlePageClick = (page: number | string) => {
		if (typeof page !== 'number') return;
		if (page < 1 || page > totalPages || page === currentPage) return;
		onPageChange(page);
	};

	return (
		<div
			className={`flex items-center justify-center gap-2 mt-6 text-sm flex-wrap ${className}`}
		>
			<button
				type="button"
				onClick={() => handlePageClick(currentPage - 1)}
				disabled={currentPage === 1}
				className="px-3 py-1 rounded border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
				aria-label="Previous page"
			>
				Previous
			</button>

			{getPageNumbers().map((page, idx) => (
				<button
					key={idx}
					type="button"
					onClick={() => handlePageClick(page)}
					disabled={page === '...'}
					className={`px-3 py-1 rounded border text-sm ${
						page === '...'
							? "cursor-default text-gray-400 border-gray-200"
							: page === currentPage
							? "bg-indigo-600 text-white border-indigo-600"
							: "border-gray-300 text-gray-700 hover:bg-gray-100"
					}`}
				>
					{page}
				</button>
			))}

			<button
				type="button"
				onClick={() => handlePageClick(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="px-3 py-1 rounded border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
				aria-label="Next page"
			>
				Next
			</button>
		</div>
	);
}
