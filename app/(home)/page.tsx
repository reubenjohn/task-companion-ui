import { Chat } from '@/components/chat';
import { Todo } from '@/components/todo/todo';
import { nanoid } from '@/lib/utils';

export default function IndexPage() {
  const id = nanoid()

  return (<div className='flex flex-row size-full'>
    <div className='flex flex-col grow w-1/2'>
      <Todo id={id} />
    </div>
    <div className='flex flex-col grow w-1/2'>
      <Chat id={id} />
    </div>
  </div>);
}
