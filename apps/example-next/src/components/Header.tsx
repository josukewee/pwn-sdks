import { Button } from "@/components/ui/button";
import Link from "next/link";
import ConnectButton from "./ConnectButton";

export default function Header() {
	return (
		<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center space-x-6">
						<Link href="/" className="font-semibold text-lg">
							PWN SDK Examples
						</Link>
						<nav className="hidden md:flex items-center space-x-4">
							<Link href="/strategies">
								<Button variant="ghost" size="sm">
									Strategies
								</Button>
							</Link>
							<Link href="/strategy/1">
								<Button variant="ghost" size="sm">
									Strategy Details
								</Button>
							</Link>
						</nav>
					</div>
					<div className="flex items-center space-x-4">
						<ConnectButton />
						<Link
							href="https://github.com/pwndao"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button variant="ghost" size="icon">
								<svg
									aria-label="GitHub"
									role="img"
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
							</Button>
						</Link>
						<Link
							href="https://docs.pwn.xyz"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button variant="ghost" size="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									aria-label="Docs"
									role="img"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
