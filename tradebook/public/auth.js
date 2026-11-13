const form=document.getElementById('authForm'),status=document.getElementById('authStatus');
// Confirmation links may include a token fragment; password sign-in establishes the HttpOnly session.
if(location.hash)history.replaceState(null,'',location.pathname);
form?.addEventListener('submit',async event=>{
 event.preventDefault();const values=new FormData(form),signup=form.dataset.mode==='signup',button=form.querySelector('button');
 if(signup&&values.get('password')!==values.get('confirm')){status.textContent='Your passwords do not match.';return;}
 button.disabled=true;status.textContent=signup?'Creating your account…':'Signing in…';
 try{const response=await fetch(signup?'/api/signup':'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:values.get('email'),password:values.get('password')})});const data=await response.json();if(!response.ok)throw Error(data.error||'Please try again.');
 if(data.confirmationRequired){status.textContent='Check your inbox to confirm your email, then return here to sign in. If you already have an account, sign in instead.';form.querySelectorAll('input[type=password]').forEach(input=>input.value='');button.disabled=false;const a=document.createElement('a');a.href='/login';a.textContent=' Continue to sign in →';status.append(a);}
 else location.assign(data.redirect||'/');
 }catch(error){status.textContent=error.message;button.disabled=false;}
});
document.getElementById('signOut')?.addEventListener('click',async event=>{event.target.disabled=true;try{const r=await fetch('/api/logout',{method:'POST'});if(!r.ok)throw Error('Unable to sign out. Please retry.');location.replace('/login');}catch(e){status.textContent=e.message;event.target.disabled=false;}});
