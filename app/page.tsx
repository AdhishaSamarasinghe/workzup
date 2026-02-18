import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/employer/create-job/my-postings');
}
