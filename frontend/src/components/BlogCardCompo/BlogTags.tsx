type Prop = {
    tags: string[]
}

export const BlogTags = ({ tags }: Prop) => {

    return (
        <>
            {
                tags.length > 0 &&
                tags?.map((tag) => {
                    return (
                        <div key={tag} className="text-xs px-2.5 py-1 flex items-center rounded-full text-center text-accent-ink bg-accent-soft border border-accent/25"> {tag} </div>
                    )
                })
            }
        </>
    )
}
