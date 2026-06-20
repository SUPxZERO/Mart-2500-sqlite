import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { t } from '@/i18n';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title={t('auth.log_in')} />

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    {status}
                </div>
            )}

            <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h2>
                <p className="text-slate-500 text-sm">Please enter your credentials to log in.</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value={t('auth.email')} className="text-slate-700 font-semibold mb-1" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-full border-slate-200 px-5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value={t('auth.password')} className="text-slate-700 font-semibold mb-1" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-full border-slate-200 px-5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded-full border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500 transition-colors group-hover:border-indigo-500"
                        />
                        <span className="ms-2 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                            {t('auth.remember_me')}
                        </span>
                    </label>
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full py-3.5 justify-center text-sm font-bold shadow-indigo-500/30 shadow-lg hover:shadow-indigo-500/50 rounded-full transition-all" disabled={processing}>
                        {t('auth.log_in')}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
