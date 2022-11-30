import { useEffect, useState } from 'react';
import p from '@/global_states/profile';
import { animated, useTransition } from 'react-spring';
import EmailPanel from './email_panel';
import LoginCodePanel from './login_code_panel';
import UserPanel from './user_panel';
import { Step } from './constants';
import PageContainer from '../page_container';

function Login() {
  const profile = p.useState();

  const [step, setStep] = useState(Step.FIRST);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (profile) {
      setStep(Step.THIRD);
    } else {
      setStep(Step.FIRST);
    }
  }, [profile]);

  const transitions = useTransition(step, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
  return (
    <PageContainer>
      {transitions((style, s) => {
        switch (s) {
          case Step.FIRST: {
            return (
              <animated.div style={style}>
                <EmailPanel
                  updateEmail={setEmail}
                  toNext={() => setStep(Step.SECOND)}
                />
              </animated.div>
            );
          }
          case Step.SECOND: {
            return (
              <animated.div style={style}>
                <LoginCodePanel
                  email={email}
                  toPrevious={() => setStep(Step.FIRST)}
                />
              </animated.div>
            );
          }
          case Step.THIRD: {
            return (
              <animated.div style={style}>
                <UserPanel />
              </animated.div>
            );
          }
          default: {
            return null;
          }
        }
      })}
    </PageContainer>
  );
}

export default Login;
