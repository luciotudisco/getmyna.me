'use client';

import * as React from 'react';
import {
    Drawer as DrawerPrimitive,
    DrawerTrigger,
    DrawerPortal,
    DrawerClose,
    DrawerOverlay as DrawerPrimitiveOverlay,
    DrawerContent as DrawerPrimitiveContent,
    DrawerTitle as DrawerPrimitiveTitle,
    DrawerDescription as DrawerPrimitiveDescription,
} from 'vaul';

import { cn } from '@/lib/utils';

const Drawer = DrawerPrimitive;

const DrawerOverlay = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitiveOverlay>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitiveOverlay>
>(({ className, ...props }, ref) => (
    <DrawerPrimitiveOverlay
        ref={ref}
        className={cn('fixed inset-0 z-40 bg-black/50', className)}
        {...props}
    />
));
DrawerOverlay.displayName = DrawerPrimitiveOverlay.displayName;

const DrawerContent = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitiveContent>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitiveContent>
>(({ className, children, ...props }, ref) => (
    <DrawerPortal>
        <DrawerOverlay />
        <DrawerPrimitiveContent
            ref={ref}
            className={cn(
                'fixed z-50 flex flex-col rounded-t-[10px] border bg-background p-6 shadow-lg top-auto left-0 right-0 bottom-0 mt-24 h-auto max-h-[80%] sm:left-auto sm:right-0 sm:top-0 sm:bottom-0 sm:h-full sm:w-80 sm:rounded-l-[10px] sm:rounded-t-none',
                className,
            )}
            {...props}
        >
            {children}
        </DrawerPrimitiveContent>
    </DrawerPortal>
));
DrawerContent.displayName = DrawerPrimitiveContent.displayName;

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('grid gap-1.5 text-center sm:text-left', className)} {...props} />
);

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('mt-auto flex flex-col gap-2', className)} {...props} />
);

const DrawerTitle = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitiveTitle>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitiveTitle>
>(({ className, ...props }, ref) => (
    <DrawerPrimitiveTitle
        ref={ref}
        className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        {...props}
    />
));
DrawerTitle.displayName = DrawerPrimitiveTitle.displayName;

const DrawerDescription = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitiveDescription>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitiveDescription>
>(({ className, ...props }, ref) => (
    <DrawerPrimitiveDescription
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
    />
));
DrawerDescription.displayName = DrawerPrimitiveDescription.displayName;

export {
    Drawer,
    DrawerTrigger,
    DrawerPortal,
    DrawerClose,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
};

