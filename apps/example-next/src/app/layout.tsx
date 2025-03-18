import "./global.css";
import Header from "@/components/Header";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata = {
	title: "PWN SDK Examples",
	description: "Example components to interact with the PWN Protocol",
};

export default function RootLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<Providers>
					<div className="min-h-screen flex flex-col">
						<Header />
						<main className="flex-1">{children}</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
