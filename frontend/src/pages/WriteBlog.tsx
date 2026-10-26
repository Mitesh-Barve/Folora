
import { NavLinks } from '../components/NavBar/NavLinks'
import Tiptap from '../components/Tiptap/Tiptap'

export const WriteBlog = () => {

    return (
        <div className='flex flex-col items-center w-screen min-h-screen bg-canvas  '>
            <NavLinks ></NavLinks>
            <div className='surface-card w-full max-w-[780px] mx-4 my-8 px-4 md:px-8 py-2 '>
                <Tiptap />
            </div>
        </div>
    )
}
