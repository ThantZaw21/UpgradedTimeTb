package com.timetable.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onResume() {
        super.onResume();
        triggerWidgetRefresh();
    }

    private void triggerWidgetRefresh() {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(this);
        ComponentName provider = new ComponentName(this, TimetableWidgetProvider.class);
        int[] widgetIds = appWidgetManager.getAppWidgetIds(provider);
        if (widgetIds.length == 0) {
            return;
        }

        Intent intent = new Intent(this, TimetableWidgetProvider.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds);
        sendBroadcast(intent);
    }
}
