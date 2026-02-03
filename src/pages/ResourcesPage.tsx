import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StepCard } from '@/components/common/StepCard';
import { BookOpen, Search, Send, CheckCircle, Edit, RefreshCcw } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-4xl">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Resources</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Problem Statement Submission Cycle</p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
          <p className="text-sm text-foreground">
            This page explains how a Problem Statement moves through the inCamp system. Department Admins are responsible for creating, submitting, and responding to feedback during this process.
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Problem Statement Submission Cycle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StepCard
              icon={BookOpen}
              title="Drafting"
              description={<>
                <ul className="list-disc pl-4">
                  <li>Faculty shares problem ideas offline</li>
                  <li>Department Admin creates the Problem Statement</li>
                  <li>Status: Draft — Editing is allowed</li>
                </ul>
              </>}
            />

            <StepCard
              icon={Search}
              title="Department Review"
              description={<>
                <ul className="list-disc pl-4">
                  <li>Department Admin reviews details</li>
                  <li>Checks category, difficulty, and faculty owner</li>
                  <li>Prepares PS for submission</li>
                </ul>
              </>}
            />

            <StepCard
              icon={Send}
              title="Submit to Institution"
              description={<>
                <ul className="list-disc pl-4">
                  <li>Department Admin submits PS to Institution</li>
                  <li>Editing is locked</li>
                  <li>Status: Submitted</li>
                </ul>
              </>}
            />

            <StepCard
              icon={RefreshCcw}
              title="Institution Review"
              description={<>
                <ul className="list-disc pl-4">
                  <li>Institution Admin reviews the submission</li>
                  <li>Feedback may be given</li>
                  <li>Status: Under Review / Revision Required</li>
                </ul>
              </>}
            />

            <StepCard
              icon={Edit}
              title="Revision (If Required)"
              description={<>
                <ul className="list-disc pl-4">
                  <li>Department Admin receives feedback</li>
                  <li>Updates the PS</li>
                  <li>Resubmits for review</li>
                </ul>
              </>}
            />

            <StepCard
              icon={CheckCircle}
              title="Approved"
              description={<>
                <ul className="list-disc pl-4">
                  <li>Institution approves the PS</li>
                  <li>Status: Approved</li>
                  <li>PS becomes available for students</li>
                </ul>
              </>}
            />
          </div>
        </div>

        {/* Responsibilities */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Department Admin Responsibilities</h3>
          <ul className="list-disc pl-4 text-sm text-foreground">
            <li>Create accurate Problem Statements</li>
            <li>Review before submission</li>
            <li>Submit within deadlines</li>
            <li>Respond to feedback</li>
            <li>Track PS status regularly</li>
          </ul>
        </div>

        {/* Important Notes */}
        <div className="bg-secondary/10 rounded-xl border border-border p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-foreground mb-2">Important Notes</h4>
          <div className="text-sm text-muted-foreground">
            <ul className="list-disc pl-4">
              <li>Department Admin cannot approve PS</li>
              <li>Submitted PS cannot be edited unless returned</li>
              <li>Deadlines are strict</li>
              <li>Status updates appear in Dashboard and Alerts</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
