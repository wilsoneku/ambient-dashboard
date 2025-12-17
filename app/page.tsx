import { Clock } from '@/app/(components)/clock/clock';
import { TodoInterface } from '@/app/(components)/todo/todo-interface';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { fetchTasks } from '@/lib/actions/todo-actions';
import { AudioPlayer } from '@/app/(components)/ambiance/audio-player';
import { GifPlayer } from '@/app/(components)/ambiance/gif-player';

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userId = session?.user.id ?? null;
    const tasks = userId ? await fetchTasks(userId) : [];

    const defaultTrack = {
        id: 'default',
        url: 'https://www.youtube.com/watch?v=f_B_WMOkl_g',
        label: 'Winter Jazz'
    }

    return (
        <div className="flex min-h-screen items-stretch justify-center bg-app font-sans text-app
                        px-4 md:px-12 lg:px-20">
            <main className="flex w-full flex-col">
                {/* Clock */}
                <section className="flex items-center justify-center pb-4 mt-3">
                    <Clock
                        timeZone="America/Los_Angeles"
                        use24Hour={false}
                        showSeconds={false}
                        className="text-app w-full max-w-3xl"
                        timeClassName="w-full text-center text-5xl md:text-6xl lg:text-7xl font-mono tracking-[0.2em] text-app"
                        dateClassName="mt-3 text-xs md:text-sm tracking-[0.3em] uppercase text-app/60 text-center w-full"
                    />
                </section>

                {/* Middle content grows but stays within viewport */}
                <section className="py-2 flex flex-1 flex-col items-center justify-center overflow-hidden">
                    {userId && (
                        <TodoInterface
                            userId={userId}
                            initialTasks={tasks}
                            texts={{ heading: 'Todo List' }}
                            className="flex flex-col w-full h-full max-w-xl
                                       border border-accent-soft rounded-md text-app"
                        />
                    )}
                </section>

                {/* Bottom ambiance bar pinned to viewport bottom */}
                <section className="mb-3 flex w-full items-center">
                    {/* Left spacer (for symmetry / future controls) */}
                    <div className="flex-1 h-24" />

                    {/* Center GIF */}
                    <div className="flex flex-1 items-center justify-center">
                        <GifPlayer className="h-48 w-48 rounded-xl" />
                    </div>

                    {/* Right: audio player stretches */}
                    <div className="flex-1 border border-accent-soft rounded-xl px-4 py-3">
                        <AudioPlayer
                            defaultTrack={defaultTrack}
                            className="w-full max-w-3xl rounded-xl px-4 py-3 text-app"
                        />
                    </div>
                </section>
            </main>
        </div>
    );
}
