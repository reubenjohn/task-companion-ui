import { Chat } from '@/components/chat';
import { TaskList } from '@/components/task/task-list';
import { nanoid } from '@/lib/utils';

export default function IndexPage() {
  const id = nanoid()

  return (<div className='flex flex-row size-full'>
    <div className='flex flex-col grow border w-1/2'>
      <TaskList id={id} />
    </div>
    <div className='flex flex-col grow border w-1/2'>
      <Chat id={id} />
    </div>
  </div>);
}
