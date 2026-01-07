import { Label } from '@radix-ui/react-label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const Register = () => {
  const handleSubmit = () => {
    console.log('Register form submitted')
  }
  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='register-name'>Full name</Label>
        <Input id='register-name' type='text' placeholder='John Doe' required />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='register-email'>Email</Label>
        <Input
          id='register-email'
          type='email'
          placeholder='your@email.com'
          required
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='register-password'>Password</Label>
        <Input
          id='register-password'
          type='password'
          placeholder='••••••••'
          required
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='register-confirm'>Confirm password</Label>
        <Input
          id='register-confirm'
          type='password'
          placeholder='••••••••'
          required
        />
      </div>
      <Button type='submit' className='w-full'>
        Register
      </Button>
    </form>
  )
}

export default Register
