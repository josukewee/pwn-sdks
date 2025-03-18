<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
</script>

<template>
  <div className="container mx-auto h-screen px-4 py-8 flex flex-col">

    <div className="flex flex-col items-center text-center mb-12">
      <h1 className="text-4xl font-bold tracking-tight mb-4">PWN SDK Examples</h1>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Example components to interact with the PWN Protocol
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Strategies</CardTitle>
            <CardDescription>View all strategies</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              See all strategies and their details
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              <router-link to="/strategies">View All Strategies</router-link>
            </Button>
          </CardFooter>
        </Card>
    </div>
  </div>
</template>
