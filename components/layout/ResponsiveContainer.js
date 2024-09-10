'use client';

const ResponsiveContainer = ({ className='', children }) => {
    return (
        <div className={`w-full h-fit max-w-screen-2xl mx-auto lg:px-20 md:px-10 sm:px-5 px-4 ${className}`}>
            {children}
        </div>
    );
};

export default ResponsiveContainer;