import {Check, Lock} from 'lucide-react';

export function CustomerPlan({data}: {data: any}) {
    const storageMb = Math.round(data.allowance.bytes / 1024 ** 2);
    return <div className="plans">
        <section className="plan-card">
            <span className="eyebrow">YOUR CURRENT ACCESS</span>
            <h2>Schema prototype</h2>
            <strong>₹0 <small>/ during the pilot</small></strong>
            <p>{storageMb} MB of private media storage.<br/>
                Journal pages, photos, voice notes and all current themes.<br/>
                {data.capabilities.ai
                    ? `${data.allowance.ai} memory-assistant questions each month.`
                    : 'Memory assistant access requires activation for your account.'}
            </p>
            <p className="help-text">Approved research accounts can run up to five public-event searches a day. You review the facts before adding them to a page.</p>
            <span className="status-label"><Check size={15}/>No payment or subscription</span>
        </section>
        <section className="plan-card plus-plan">
            <span className="eyebrow">PROPOSED PLAN</span>
            <h2>Schema Plus</h2>
            <strong>₹149 <small>/ month</small></strong>
            <p>5 GB of media storage.<br/>
                50 memory-assistant questions a month.<br/>
                One event research run a month.</p>
            <p className="help-text">This is the proposed plan from our Kritical submission. It is not on sale. Current pilot limits are shown separately on the left.</p>
            <span className="status-label"><Lock size={15}/>Subscriptions are not open</span>
        </section>
    </div>;
}
