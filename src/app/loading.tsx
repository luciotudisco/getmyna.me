import LoadingMessage from '@/components/LoadingMessage';

export default function AppLoading() {
    return (
        <div className="flex min-h-screen flex-col items-center gap-5 py-24 align-middle">
            <LoadingMessage />
        </div>
    );
}
