function Loader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">Loading...</p>
            </div>
        </div>
    )
}

export default Loader