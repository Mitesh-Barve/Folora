import { useNavigate } from 'react-router-dom'

export const UnAuth = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className=" flex h-screen justify-center items-center bg-canvas px-6">
                <div className="surface-card flex flex-col p-8 gap-5 items-center max-w-md text-center">
                    <h1 className="text-2xl md:text-3xl font-semibold font-serif text-neutral-900 ">Please authenticate yourself to continue</h1>
                    <button onClick={() => navigate("/login")} className="btn-primary px-6 h-11 font-medium "> Re-Login </button>
                </div>
            </div>
        </>
    )
}
