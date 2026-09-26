# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
from dataclasses import dataclass

STATUS_ACCEPTED = "ACCEPTED"


@gl.contract_interface
class GlyphworkTasks:
    class View:
        def get_reward_wei(self, bounty_id: str) -> u256: ...
        def get_sponsor(self, bounty_id: str) -> Address: ...
        def get_bounty_payment_state(self, bounty_id: str) -> tuple[str, Address, Address, u256]: ...

    class Write:
        def vault_mark_funded(self, bounty_id: str) -> None: ...
        def mark_paid(self, bounty_id: str) -> None: ...
        def mark_refunded(self, bounty_id: str) -> None: ...


@gl.evm.contract_interface
class Recipient:
    class View:
        pass

    class Write:
        pass


@allow_storage
@dataclass
class Deposit:
    bounty_id: str
    sponsor: Address
    amount: u256
    paid: bool
    refunded: bool


class Contract(gl.Contract):
    tasks: Address
    deposits: TreeMap[str, Deposit]
    credited_total: u256
    paid_total: u256
    refunded_total: u256

    def __init__(self, tasks: Address):
        self.tasks = tasks
        self.credited_total = u256(0)
        self.paid_total = u256(0)
        self.refunded_total = u256(0)

    @gl.public.write.payable
    def fund_bounty(self, bounty_id: str) -> None:
        if bounty_id in self.deposits:
            raise gl.vm.UserError("ALREADY_FUNDED")
        required = GlyphworkTasks(self.tasks).view().get_reward_wei(bounty_id)
        sponsor = GlyphworkTasks(self.tasks).view().get_sponsor(bounty_id)
        if sponsor != gl.message.sender_address:
            raise gl.vm.UserError("ONLY_SPONSOR")
        if gl.message.value != required:
            raise gl.vm.UserError("EXACT_REWARD_REQUIRED")
        self.deposits[bounty_id] = Deposit(bounty_id, sponsor, gl.message.value, False, False)
        self.credited_total = self.credited_total + gl.message.value
        GlyphworkTasks(self.tasks).emit(on="finalized").vault_mark_funded(bounty_id)

    @gl.public.write
    def release_accepted(self, bounty_id: str, worker: Address) -> None:
        if gl.message.sender_address != self.tasks:
            raise gl.vm.UserError("ONLY_TASKS")
        deposit = self.deposits[bounty_id]
        if deposit.paid or deposit.refunded:
            raise gl.vm.UserError("SETTLED")
        state = GlyphworkTasks(self.tasks).view().get_bounty_payment_state(bounty_id)
        if state[0] != STATUS_ACCEPTED:
            raise gl.vm.UserError("NOT_ACCEPTED")
        if state[2] != worker:
            raise gl.vm.UserError("WRONG_WORKER")
        if state[3] != deposit.amount:
            raise gl.vm.UserError("REWARD_MISMATCH")
        deposit.paid = True
        self.deposits[bounty_id] = deposit
        self.paid_total = self.paid_total + deposit.amount
        Recipient(worker).emit_transfer(value=deposit.amount)
        GlyphworkTasks(self.tasks).emit(on="finalized").mark_paid(bounty_id)

    @gl.public.write
    def refund_expired(self, bounty_id: str) -> None:
        if gl.message.sender_address != self.tasks:
            raise gl.vm.UserError("ONLY_TASKS")
        self._refund(bounty_id)

    @gl.public.write
    def refund_unavailable(self, bounty_id: str) -> None:
        if gl.message.sender_address != self.tasks:
            raise gl.vm.UserError("ONLY_TASKS")
        self._refund(bounty_id)

    def _refund(self, bounty_id: str) -> None:
        deposit = self.deposits[bounty_id]
        if deposit.paid or deposit.refunded:
            raise gl.vm.UserError("SETTLED")
        deposit.refunded = True
        self.deposits[bounty_id] = deposit
        self.refunded_total = self.refunded_total + deposit.amount
        Recipient(deposit.sponsor).emit_transfer(value=deposit.amount)
        GlyphworkTasks(self.tasks).emit(on="finalized").mark_refunded(bounty_id)

    @gl.public.view
    def is_funded(self, bounty_id: str) -> bool:
        return bounty_id in self.deposits

    @gl.public.view
    def was_paid(self, bounty_id: str) -> bool:
        return self.deposits[bounty_id].paid

    @gl.public.view
    def was_refunded(self, bounty_id: str) -> bool:
        return self.deposits[bounty_id].refunded

    @gl.public.view
    def conservation(self) -> tuple[u256, u256, u256, u256]:
        return (self.credited_total, self.paid_total, self.refunded_total, self.credited_total - self.paid_total - self.refunded_total)
