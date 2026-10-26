type Prop = {
    onClick : () => void
}
export const Dropdown = ({onClick}: Partial<Prop>) => {
    return (
        <>
        {/* user svg */}
            <button className="pt-3" onClick={onClick} >
                <img src="/user.svg" className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover ring-1 ring-stone-200 bg-surface transition-shadow hover:shadow-card" alt="usersvg" />
            </button>
        </>
    )   
}
