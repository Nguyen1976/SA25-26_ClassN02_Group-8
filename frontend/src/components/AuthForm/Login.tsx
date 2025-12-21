import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'
import { formLoginScheme } from './scheme'
import { zodResolver } from '@hookform/resolvers/zod'
import type z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { loginAPI } from '@/redux/slices/userSlice'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/redux/store'
import { useNavigate } from 'react-router'

const Login = () => {
  const form = useForm<z.infer<typeof formLoginScheme>>({
    resolver: zodResolver(formLoginScheme),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const onSubmit = async (data: z.infer<typeof formLoginScheme>) => {
    console.log(data)
    dispatch(loginAPI(data)).then((res) => {
      if (loginAPI.fulfilled.match(res)) {
        navigate('/')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='space-y-2'>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder='******' {...field} type='password' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type='submit' className='w-full'>
          Sign in
        </Button>
      </form>
    </Form>
  )
}

export default Login
