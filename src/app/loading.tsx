import Loading from '@/components/Loading';

export default function AppLoading() {
    return (
        <div className="flex min-h-screen flex-col items-center gap-5 py-24 align-middle">
            <Loading />
            <p className="text-md text-muted-foreground">Hang tight — your info is on the way…</p>
        </div>
    );
}
