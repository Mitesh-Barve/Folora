type Prop = {
    username: string,
    datePublished: string,
    title: string,
    brief: string
}

export const BlogData = ({username, title, datePublished, brief} : Prop) => {
    return (
        <div className=" col-span-4 md:col-span-2 lg:col-span-2">
            <div className="flex items-center">
                {/* user img */}
                <div className=" rounded-full w-[1.15rem] h-[1.15rem] lg:w-5 lg:h-5 ">
                    <img className=" h-[1.10rem] w-5" src="user.svg" alt="usersvg" />
                </div>
                {/* userName */}
                <div className="pl-1 font-sans text-xs text-neutral-600">{`${username.split(' ').length === 2 ? `${username.split(' ')[0]} ${username.split(' ')[1][0]}.` : username}`}</div>
                {/* small dot */}
                <div className="relative">
                    <span className="text-neutral-400 absolute -bottom-2 left-[0.19rem] lg:left-[0.15rem] lg:-bottom-2 ">.</span>
                </div>
                {/* date published */}
                <div className="pl-2 text-xs text-neutral-400">{datePublished}</div>
            </div>

            <div>
                {/* Blog title */}
                <h1 className=" pt-4 text-xl md:text-2xl lg:text-3xl font-semibold font-serif tracking-tight leading-snug text-neutral-900 ">{title}</h1>
                {/* part of blog content */}
                <div className=" pt-3 text-sm md:text-base font-normal tracking-wide text-neutral-500 line-clamp-2 ">{brief}</div>
            </div>
        </div>
    )
}
