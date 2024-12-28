import Carousel from '@/components/Carousel';
import Feature from '@/components/Feature';
import SearchBar from '@/components/SearchBar';

export default function Home() {
    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 p-10">
                <SearchBar />
                <Carousel />
                <Feature
                    color="#c5dedd"
                    description="A domain name that is easy to recall ensures people can find you. What's simpler than your own name?"
                    image="bulb.svg"
                    title="Memorable Matters"
                />
                <Feature
                    color="#bcd4e6"
                    description="A vanity domain sets you apart online, representing your personal brand. Secure it before someone else does!"
                    image="target.svg"
                    title="Claim Your Unique Spot"
                />
                <Feature
                    color="#f0efeb"
                    description="A vanity domain shows you mean business. Stand out and leave a lasting impression. Seize this opportunity today!"
                    image="push-pins.svg"
                    title="Look Professional"
                />
                <Feature
                    color="#fde2e4"
                    description="A vanity domain is your digital license plate: memorable, stylish, and sure to leave an impression!"
                    image="presentation.svg"
                    title="Boost your ego"
                />
            </main>
        </div>
    );
}
