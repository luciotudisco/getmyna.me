import DomainStatusIndicator from '@/components/DomainStatusIndicator';

interface DomainProps {
    domain: string;
}

export default function Domain(props: DomainProps) {
    const { domain } = props;

    return (
        <div
            className="bg-gradient-to-t-100 min-h-16 w-full rounded-none p-5 align-middle font-mono shadow-sm"
            key={domain}
        >
            <div className="flex flex-row justify-between">
                <p className="font-extralight lowercase">{domain}</p>
                <DomainStatusIndicator domain={domain} />
            </div>
        </div>
    );
}
