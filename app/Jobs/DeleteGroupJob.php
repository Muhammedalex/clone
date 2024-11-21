<?php

namespace App\Jobs;

use App\Events\GroupDeleted;
use App\Models\Group;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DeleteGroupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The group instance to be deleted.
     */
    public Group $group;

    /**
     * Create a new job instance.
     */
    public function __construct(Group $group)
    {
        $this->group = $group;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $id = $this->group->id;
        $name = $this->group->name;

        // Set last_message_id to null and save the group
        $this->group->last_message_id = null;
        $this->group->save();

        // Delete all messages associated with the group
        $this->group->messages->each->delete();

        // Detach all users from the group
        $this->group->users()->detach();

        // Delete the group
        $this->group->delete();

        // Dispatch the GroupDeleted event
        GroupDeleted::dispatch($id, $name);
    }
}
