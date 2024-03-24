import { EventWindow } from '@/components/event/event-window'
import { TaskList } from '@/components/task/task-list'
import { Event } from '@/lib/event-types'
import { nanoid } from '@/lib/utils'
import { getFeed } from '../actions'

export default async function IndexPage() {
  async function tryGetFeed(): Promise<{ events: Event[], error?: string }> {
    try {
      return { events: await getFeed() }
    } catch (error: any) {
      console.log(error)
      return { events: [], error: error.message }
    }
  }

  const { events, error } = await tryGetFeed()

  return (<div className='flex flex-row size-full'>
    <div className='flex flex-col grow w-1/2 border-r my-4 items-center'>
      <TaskList />
    </div>
    <div className='flex flex-col grow w-1/2'>
      <EventWindow events={events} eventsError={error} />
    </div>
  </div>)
}
