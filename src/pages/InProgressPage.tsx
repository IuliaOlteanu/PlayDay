function InProgressPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#f0f4f8]">
            <div className="text-center p-6 rounded-lg shadow-lg bg-white">
                <h1 className="text-5xl font-extrabold text-[#065C64] mb-6">Work in Progress</h1>
                <p className="text-lg text-gray-700 mb-6">We're busy working on something amazing.</p>

                {/* Animated spinner */}
                <div className="w-16 h-16 border-4 border-t-4 border-[#065C64] border-dashed rounded-full animate-spin mx-auto mb-6"></div>

                {/* Stay tuned message */}
                <p className="text-lg text-[#065C64] font-medium mb-4">Stay tuned for more!</p>

                {/* Progress message */}
                <p className="text-sm text-gray-600">We're hard at work bringing something great. Check back soon!</p>

                {/* Button to encourage interaction */}
                <div className="mt-6">
                    <a href="/" className="text-[#065C64] hover:text-[#044E4F] font-semibold underline">
                        Go back to homepage
                    </a>
                </div>
            </div>
        </div>
    );
}

export default InProgressPage;