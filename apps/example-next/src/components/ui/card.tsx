import type * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.ComponentProps<"div"> {
	isLoading?: boolean;
}

function Card({ className, isLoading, ...props }: CardProps) {
	return (
		<div
			data-slot="card"
			className={cn(
				"bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
				isLoading && "animate-pulse",
				className,
			)}
			{...props}
		/>
	);
}

interface CardComponentProps extends React.ComponentProps<"div"> {
	isLoading?: boolean;
}

function CardHeader({ className, isLoading, ...props }: CardComponentProps) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				"flex flex-col gap-1.5 px-6",
				isLoading && "animate-pulse",
				className,
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, isLoading, ...props }: CardComponentProps) {
	return (
		<div
			data-slot="card-title"
			className={cn(
				"leading-none font-semibold",
				isLoading && "h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4",
				className,
			)}
			{...props}
		/>
	);
}

function CardDescription({
	className,
	isLoading,
	...props
}: CardComponentProps) {
	return (
		<div
			data-slot="card-description"
			className={cn(
				"text-muted-foreground text-sm",
				isLoading && "h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2",
				className,
			)}
			{...props}
		/>
	);
}

function CardContent({ className, isLoading, ...props }: CardComponentProps) {
	if (isLoading) {
		return (
			<div data-slot="card-content" className={cn("px-6 space-y-3", className)}>
				<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
				<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
				<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
			</div>
		);
	}

	return (
		<div
			data-slot="card-content"
			className={cn("px-6", className)}
			{...props}
		/>
	);
}

function CardFooter({ className, isLoading, ...props }: CardComponentProps) {
	return (
		<div
			data-slot="card-footer"
			className={cn("flex items-center px-6", className)}
			{...(isLoading ? {} : props)}
		>
			{isLoading ? (
				<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
			) : (
				props.children
			)}
		</div>
	);
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent,
};
